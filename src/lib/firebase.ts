import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase solo se considera "configurado" si hay apiKey y projectId reales.
// Si faltan las variables de entorno (p. ej. en un clon sin secretos, o si Vercel
// no las tiene bien puestas), NO reventamos la app: arranca en modo invitado/local
// y los datos se guardan en localStorage. Esto evita la pantalla en blanco que causaba
// `getAuth()` al lanzar `auth/invalid-api-key` durante la carga del módulo.
export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (e) {
        // Un fallo de init no debe tumbar toda la app: se continúa en modo local.
        console.error("[firebase] Inicialización fallida; se continúa en modo local:", e);
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
} else if (typeof window !== "undefined") {
    console.warn(
        "[firebase] Sin configuración (faltan NEXT_PUBLIC_FIREBASE_*). " +
        "La app funciona en modo local: login y guardado en la nube deshabilitados."
    );
}

export { app, auth, db, storage };
