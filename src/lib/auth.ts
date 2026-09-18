'use client';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth as firebaseAuth, db, firebaseApiKey, firebaseProjectId, isFirebaseConfigured } from "./firebase";
import { UserProfile } from "./types";

// Crea el documento del usuario en Firestore si aún no existe (primer login social).
async function ensureUserDoc(uid: string, email: string, provider: string): Promise<void> {
    if (!db) return;
    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, { email, createdAt: new Date().toISOString(), provider });
        }
    } catch (e) {
        console.error("ensureUserDoc error:", e);
    }
}

export interface UserAccount {
    email: string;
    uid: string;
    profile?: UserProfile;
}

const NOT_CONFIGURED = "Firebase no está configurado en este entorno (faltan las claves NEXT_PUBLIC_FIREBASE_*).";

/**
 * ¿PUEDE ESTE NAVEGADOR ENTRAR, SÍ O NO?
 *
 * Esto no espera a que falle un login para averiguarlo: se ejecuta al abrir la
 * página. La idea es que quien abre /login vea escrito en pantalla por qué no
 * puede entrar, sin escribir la contraseña, sin abrir la consola y sin tener
 * que mandarle una captura a nadie.
 *
 * Se prueban DOS sitios y lo que dice la verdad es la DIFERENCIA entre ellos:
 *
 *   - la propia web responde y Google no -> algo corta Google en concreto:
 *     un bloqueador de contenido, una extensión, el DNS de la red o un firewall.
 *   - no responde ninguno                -> no hay internet (o hay un portal de
 *     wifi de esos que piden aceptar antes de dejarte salir).
 *   - responden los dos                  -> el corte no es de red; entonces la
 *     culpa es de la aplicación y hay que mirar otra cosa.
 *
 * A Google se le pregunta por el MISMO sitio al que llama el SDK al iniciar
 * sesión (identitytoolkit, con la misma clave), así que si esta comprobación
 * pasa y el login falla, el problema ya no es "no llego a Google".
 */
export interface EstadoAcceso {
    ok: boolean;
    /** Una línea para enseñar siempre, esté bien o mal. */
    texto: string;
    /** Qué hacer, cuando hay algo que hacer. */
    detalle?: string;
    /** A qué proyecto de Firebase está hablando ESTA copia desplegada. */
    proyecto: string;
}

async function alcanzaLaRed(url: string): Promise<boolean> {
    try {
        // `no-cors` a propósito: no interesa LEER la respuesta, sólo saber si la
        // petición llega a salir. Si algo la bloquea, fetch lanza.
        await fetch(url, { mode: "no-cors", cache: "no-store" });
        return true;
    } catch {
        return false;
    }
}

/**
 * Llama al endpoint público de configuración de Firebase Auth: el mismo host y
 * la misma clave que usa signInWithEmailAndPassword. Devuelve el código HTTP y
 * el motivo que da Google, o código 0 si la petición ni siquiera llegó a salir
 * (que es justo lo que hace un bloqueador).
 */
async function preguntaAFirebase(): Promise<{ codigo: number; motivo: string }> {
    try {
        const r = await fetch(
            `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(firebaseApiKey)}`,
            { cache: "no-store" }
        );
        let motivo = "";
        try {
            const cuerpo = await r.json();
            motivo = cuerpo?.error?.message || "";
        } catch { /* sin cuerpo legible: nos quedamos con el código */ }
        return { codigo: r.status, motivo };
    } catch {
        return { codigo: 0, motivo: "" };
    }
}

/**
 * LA SEGUNDA PRUEBA, LA QUE DE VERDAD IMPORTA.
 *
 * `comprobarAcceso` hace un GET y puede salir "correcta" mientras el login sigue
 * fallando: eso ya ha pasado, y con ello se descartó que fuera cosa de la red o
 * del proyecto. Lo que hace el SDK al iniciar sesión es otra cosa -un POST con
 * JSON al mismo servidor- y hay bloqueadores, extensiones y antivirus que dejan
 * pasar lo primero y cortan lo segundo.
 *
 * Así que se repite la petición EXACTA que hace el SDK, en su forma inofensiva:
 * `accounts:createAuthUri` es el mismo host, la misma clave, el mismo método y
 * la misma cabecera, pero sólo pregunta "¿existe este email y con qué ha
 * entrado?". No inicia sesión, no crea nada y no necesita la contraseña.
 *
 * Con eso, cuando el login falle se sabe de qué lado está el fallo sin tener que
 * pedirle a nadie que abra la consola del navegador.
 */
export interface PruebaDePost {
    salio: boolean;        // ¿llegó a salir la petición?
    codigo: number;
    motivo: string;
    proveedores: string[]; // con qué ha entrado antes ese email
    registrado: boolean | null;
}

export async function probarPeticionDeAcceso(email: string): Promise<PruebaDePost> {
    const vacio: PruebaDePost = { salio: false, codigo: 0, motivo: "", proveedores: [], registrado: null };
    if (!firebaseApiKey) return vacio;
    try {
        const r = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${encodeURIComponent(firebaseApiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({
                    identifier: email || "prueba@scenemeapp.com",
                    continueUri: `${window.location.origin}/login`,
                }),
            },
        );
        let cuerpo: Record<string, unknown> = {};
        try { cuerpo = await r.json(); } catch { /* da igual: el código ya dice bastante */ }
        const error = cuerpo.error as { message?: string } | undefined;
        return {
            salio: true,
            codigo: r.status,
            motivo: error?.message || "",
            proveedores: (cuerpo.allProviders as string[] | undefined) || (cuerpo.signinMethods as string[] | undefined) || [],
            registrado: typeof cuerpo.registered === "boolean" ? cuerpo.registered : null,
        };
    } catch {
        return vacio;
    }
}

/**
 * Lo que se le enseña a quien acaba de fallar al entrar: una frase que dice de
 * qué lado está el problema, escrita a partir de lo que respondió el servidor y
 * no de lo que parecía más probable.
 */
export async function porQueNoEntra(email: string, codigoFirebase: string): Promise<string> {
    const prueba = await probarPeticionDeAcceso(email);

    if (!prueba.salio) {
        return "La página sí habla con Google, pero la petición de ENTRAR no llega a salir. Eso es un bloqueador de contenido, una extensión del navegador o un antivirus que corta justo esa llamada: dejan pasar lo demás y bloquean el acceso. Desactívalo para scenemeapp.com, o prueba con los datos del móvil o en otro navegador.";
    }

    if (prueba.registrado === false) {
        return `Ese email no tiene cuenta en este proyecto. Regístrate con «¿No tienes cuenta?», o comprueba si te registraste con otra dirección. (respuesta del servidor: ${prueba.codigo})`;
    }

    if (prueba.proveedores.length && !prueba.proveedores.includes("password")) {
        return `Esa cuenta existe, pero entró con ${prueba.proveedores.join(" y ")}, no con contraseña. Usa «Continuar con Google».`;
    }

    if (prueba.motivo) {
        return `El servidor contesta «${prueba.motivo}» (código ${prueba.codigo}). Es configuración del proyecto de Firebase, no de tu navegador.`;
    }

    return `La red llega bien y la petición de acceso sale y vuelve (código ${prueba.codigo}), así que no es tu conexión ni un bloqueador. El fallo lo da Firebase como «${codigoFirebase || "sin código"}». Pásame esta frase entera.`;
}

export async function comprobarAcceso(): Promise<EstadoAcceso> {
    const proyecto = firebaseProjectId;
    if (typeof window === "undefined") return { ok: true, texto: "", proyecto };

    if (!isFirebaseConfigured) {
        return {
            ok: false,
            proyecto,
            texto: "Esta copia de la web no tiene las claves de Firebase.",
            detalle: "Faltan las variables NEXT_PUBLIC_FIREBASE_* en el despliegue. Sin ellas no hay login posible; hay que ponerlas en Vercel y volver a desplegar.",
        };
    }

    if (navigator.onLine === false) {
        return {
            ok: false,
            proyecto,
            texto: "El navegador dice que estás sin conexión.",
            detalle: "Conéctate a una red y recarga la página.",
        };
    }

    const [propia, { codigo, motivo }] = await Promise.all([
        alcanzaLaRed(`${window.location.origin}/favicon.ico?d=${Date.now()}`),
        preguntaAFirebase(),
    ]);

    // La petición no salió: alguien la está cortando.
    if (codigo === 0) {
        if (!propia)
            return {
                ok: false,
                proyecto,
                texto: "No sale ninguna petición de este navegador.",
                detalle: "No hay internet, o estás en una wifi que pide aceptar unas condiciones antes de dejarte salir. Prueba con los datos del móvil.",
            };
        return {
            ok: false,
            proyecto,
            texto: "Esta web sí responde, pero Google NO.",
            detalle: "Algo corta la conexión con Google en concreto: un bloqueador de contenido o de anuncios (Safari, AdBlock, Coupert…), una extensión del navegador, un antivirus o el DNS de tu red. Desactívalo para scenemeapp.com y recarga, o prueba con los datos del móvil.",
        };
    }

    if (codigo === 200) return { ok: true, proyecto, texto: "Conexión con el servidor de acceso: correcta." };

    // El proyecto existe y la clave viaja bien, pero Firebase Authentication no
    // tiene configuración: no hay login posible para NADIE, no es cosa de este
    // navegador ni de esta contraseña. Se dice con todas las letras porque el
    // arreglo está en la consola de Firebase, no en el código.
    if (motivo === "CONFIGURATION_NOT_FOUND") {
        return {
            ok: false,
            proyecto,
            texto: `Firebase Authentication no está activo en el proyecto «${proyecto}».`,
            detalle: `Google contesta que ese proyecto no tiene configuración de acceso (CONFIGURATION_NOT_FOUND). No falla tu contraseña ni tu red: no puede entrar nadie. O bien hay que activar Authentication en «${proyecto}», o bien esta web está apuntando al proyecto equivocado y hay que cambiar las variables NEXT_PUBLIC_FIREBASE_* del despliegue.`,
        };
    }

    if (motivo.includes("API_KEY") || motivo.includes("blocked") || motivo.includes("BLOCKED")) {
        return {
            ok: false,
            proyecto,
            texto: "Google rechaza la clave de esta web.",
            detalle: `La clave de Firebase está restringida y no admite peticiones desde ${window.location.hostname}. Se cambia en Google Cloud → APIs y servicios → Credenciales. (${motivo})`,
        };
    }

    if (codigo === 400 || codigo === 403) {
        return {
            ok: false,
            proyecto,
            texto: "Google responde, pero rechaza la petición de esta web.",
            detalle: `Código ${codigo}${motivo ? ` (${motivo})` : ""}. Es configuración del proyecto de Firebase, no de tu navegador.`,
        };
    }

    return {
        ok: false,
        proyecto,
        texto: `El servidor de acceso responde con un error (${codigo}).`,
        detalle: "No es cosa tuya ni de tu red: es Google o la configuración del proyecto. Vuelve a intentarlo en un rato.",
    };
}

/** La misma comprobación, en una frase, para pegarla detrás de un error. */
export async function diagnosticoDeAcceso(): Promise<string> {
    const e = await comprobarAcceso();
    if (!e.texto) return "";
    return `Diagnóstico: ${e.texto}${e.detalle ? " " + e.detalle : ""}`;
}

// Errores de Firebase Auth en lenguaje humano (los códigos crudos en inglés
// confunden al actor que solo quiere entrar).
function humanAuthError(error: any, fallback: string): string {
    const code: string = error?.code || "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
        return "Email o contraseña incorrectos. Si te registraste con Google, usa «Continuar con Google».";
    if (code.includes("too-many-requests"))
        return "Demasiados intentos. Espera unos minutos o restablece tu contraseña.";
    if (code.includes("invalid-email")) return "Ese email no tiene un formato válido.";
    if (code.includes("email-already-in-use"))
        return "Ese email ya tiene cuenta. Inicia sesión (o usa «Continuar con Google» si la creaste así).";
    if (code.includes("weak-password")) return "La contraseña debe tener al menos 6 caracteres.";
    if (code.includes("network-request-failed"))
        return "No se pudo conectar con el servidor de acceso.";
    if (code.includes("configuration-not-found"))
        return "El proyecto de Firebase no tiene activado el acceso por email y contraseña. No es culpa tuya: no puede entrar nadie hasta que se active en la consola de Firebase (Authentication → Sign-in method).";
    if (code.includes("operation-not-allowed"))
        return "El acceso por email y contraseña está desactivado en Firebase. Hay que activarlo en Authentication → Sign-in method.";
    if (code.includes("user-disabled")) return "Esta cuenta está deshabilitada.";
    return error?.message || fallback;
}

export const auth = {
    // `codigo` viaja hacia fuera a propósito: el mensaje humano se escribió para
    // que se entienda, pero al esconder el código de Firebase se perdían tardes
    // enteras adivinando cuál de los diez fallos posibles era éste.
    login: async (email: string, password: string): Promise<{ success: boolean; error?: string; codigo?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
            return { success: true };
        } catch (error: any) {
            console.error("Login error FULL:", error);
            return { success: false, error: humanAuthError(error, "No se pudo iniciar sesión."), codigo: error?.code || "" };
        }
    },

    // Envía el email de restablecimiento de contraseña (camino garantizado para
    // recuperar el acceso cuando la contraseña guardada no coincide).
    resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        if (!email || !email.includes("@")) return { success: false, error: "Escribe tu email arriba y vuelve a pulsar aquí." };
        try {
            await sendPasswordResetEmail(firebaseAuth, email);
            return { success: true };
        } catch (error: any) {
            console.error("resetPassword error:", error);
            return { success: false, error: humanAuthError(error, "No se pudo enviar el email de recuperación.") };
        }
    },

    register: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            // Try to create user document, but don't fail registration if it fails (we can create it later)
            try {
                if (db) await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: email,
                    createdAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Firestore creation error (ignoring for now):", dbError);
            }
            return { success: true };
        } catch (error: any) {
            console.error("Registration error FULL:", error);
            return { success: false, error: humanAuthError(error, "No se pudo crear la cuenta.") };
        }
    },

    logout: async () => {
        if (!firebaseAuth) { localStorage.removeItem('scene_me_current_user'); return; }
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('scene_me_current_user'); // Clear legacy/cache
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    // Login con Google. POPUP SIEMPRE primero, en todos los dispositivos:
    // signInWithRedirect está roto en Safari/iOS 16.1+ (partición de almacenamiento
    // de terceros: getRedirectResult vuelve null y el login falla EN SILENCIO)
    // mientras el authDomain sea *.firebaseapp.com. El popup se comunica por
    // postMessage y sí funciona. Redirección solo como último recurso.
    loginWithGoogle: async (): Promise<{ success: boolean; redirecting?: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        const provider = new GoogleAuthProvider();
        try {
            const cred = await signInWithPopup(firebaseAuth, provider);
            await ensureUserDoc(cred.user.uid, cred.user.email || "", "google");
            return { success: true };
        } catch (error: any) {
            const code: string = error?.code || "";
            // El usuario cerró la ventana: no es un fallo técnico, avisar y ya
            if (code.includes("popup-closed") || code.includes("cancelled-popup")) {
                return { success: false, error: "Ventana de Google cerrada antes de terminar. Vuelve a intentarlo." };
            }
            // Popup bloqueado o entorno sin popups (PWA instalada) -> redirección
            if (code.includes("popup-blocked") || code.includes("operation-not-supported")) {
                try {
                    localStorage.setItem("auth_redirect_pending", String(Date.now()));
                    await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
                    return { success: true, redirecting: true };
                } catch (e: any) {
                    return { success: false, error: e?.message || "No se pudo iniciar con Google" };
                }
            }
            if (code.includes("account-exists-with-different-credential")) {
                return { success: false, error: "Ya existe una cuenta con ese email (creada con contraseña). Inicia sesión con tu email." };
            }
            if (code.includes("unauthorized-domain")) {
                return { success: false, error: "Este dominio no está autorizado en Firebase (Authentication → Dominios autorizados)." };
            }
            console.error("loginWithGoogle error:", error);
            return { success: false, error: error?.message || "No se pudo iniciar con Google" };
        }
    },

    // Completa el login tras volver de una redirección (fallback PWA). Llamar al montar.
    // Si veníamos de una redirección (flag) y no hay resultado ni sesión, es el
    // fallo silencioso de Safari/ITP: lo devolvemos como error visible.
    completeRedirectLogin: async (): Promise<{ ok: boolean; error?: string }> => {
        if (!firebaseAuth) return { ok: false };
        const pending = localStorage.getItem("auth_redirect_pending");
        try {
            const res = await getRedirectResult(firebaseAuth);
            localStorage.removeItem("auth_redirect_pending");
            if (res && res.user) {
                await ensureUserDoc(res.user.uid, res.user.email || "", "google");
                return { ok: true };
            }
            // Redirección iniciada hace <5 min pero sin resultado NI usuario: Safari la bloqueó
            if (pending && Date.now() - Number(pending) < 5 * 60 * 1000 && !firebaseAuth.currentUser) {
                return { ok: false, error: "Safari bloqueó el acceso por redirección. Vuelve a pulsar «Continuar con Google» (se abrirá una ventana)." };
            }
            return { ok: false };
        } catch (e: any) {
            localStorage.removeItem("auth_redirect_pending");
            console.error("completeRedirectLogin error:", e);
            return { ok: false, error: e?.message };
        }
    },

    // Note: This is now async in reality, but for compatibility we might need a hook or context.
    // For now, we'll keep a simple wrapper that might need refactoring in components.
    // Ideally, use a React Context for Auth.
    getCurrentUser: async (): Promise<UserAccount | null> => {
        return new Promise((resolve) => {
            if (!firebaseAuth) { resolve(null); return; } // Sin Firebase → invitado
            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    // Perfil desde Firestore (si hay db); si no, devolvemos al usuario sin perfil.
                    let profile: UserProfile | undefined;
                    if (db) {
                        try {
                            const docSnap = await getDoc(doc(db, "users", user.uid));
                            const data = docSnap.exists() ? docSnap.data() : {};
                            profile = data.profile as UserProfile | undefined;
                        } catch (e) {
                            console.error("getCurrentUser profile fetch error:", e);
                        }
                    }
                    resolve({ email: user.email || "", uid: user.uid, profile });
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    },

    updateProfile: async (profile: UserProfile): Promise<void> => {
        if (!firebaseAuth || !db) return;
        const user = firebaseAuth.currentUser;
        if (!user) return;

        try {
            // Use setDoc with merge: true instead of updateDoc
            // This ensures that if the document doesn't exist (e.g. registration failed halfway),
            // it will be created now.
            await setDoc(doc(db, "users", user.uid), {
                profile
            }, { merge: true });
            // Optional: Update local cache if needed for immediate UI updates without refetching
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }
};
