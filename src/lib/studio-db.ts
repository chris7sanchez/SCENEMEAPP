'use client';

// Persistencia del WE SCENE STUDIO:
//  - Escena del día: compartida por todos, cacheada en Firestore (dailyScenes/{fecha}).
//  - Tareas: vídeo del usuario en Storage + metadatos en Firestore (privado por uid).

import { db, storage } from './firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateDailyScene } from '@/ai/generate-daily-scene';
import { isValidScene, buildSubmissionPath, type DailyScene } from './daily-scene';

export interface Submission {
    id?: string;
    date: string;
    sceneId: string;
    title: string;
    storagePath: string;
    downloadURL: string;
    createdAt: number;
}

/**
 * Devuelve la escena de hoy. Si ya existe en Firestore la reutiliza (1 sola
 * generación por día para toda la app); si no, la genera con IA y la cachea.
 */
export async function getOrCreateDailyScene(dateKey: string): Promise<DailyScene> {
    const sceneRef = doc(db, 'dailyScenes', dateKey);
    try {
        const snap = await getDoc(sceneRef);
        if (snap.exists()) {
            const data: any = snap.data();
            if (isValidScene(data?.scene)) return data.scene as DailyScene;
        }
    } catch (e) {
        console.warn('[studio] lectura de escena del día falló, se genera local:', e);
    }

    const scene = await generateDailyScene(dateKey);
    // Cachear para los demás usuarios del día (mejor esfuerzo; si falla, no rompe).
    try {
        await setDoc(sceneRef, { scene, createdAt: Date.now() });
    } catch (e) {
        console.warn('[studio] no se pudo cachear la escena del día:', e);
    }
    return scene;
}

/** Sube el vídeo de la tarea a Storage y guarda sus metadatos en Firestore. */
export async function uploadSubmission(
    uid: string,
    dateKey: string,
    file: File,
    title: string,
): Promise<Submission> {
    const storagePath = buildSubmissionPath(uid, dateKey, file.name);
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    const meta: Submission = {
        date: dateKey,
        sceneId: dateKey,
        title: title || `Tarea ${dateKey}`,
        storagePath,
        downloadURL,
        createdAt: Date.now(),
    };
    const col = collection(db, 'users', uid, 'submissions');
    const docRef = await addDoc(col, meta);
    return { id: docRef.id, ...meta };
}

/** Lista las tareas del propio usuario, de la más reciente a la más antigua. */
export async function listMySubmissions(uid: string): Promise<Submission[]> {
    try {
        const col = collection(db, 'users', uid, 'submissions');
        const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as Submission) }));
    } catch (e) {
        console.warn('[studio] no se pudieron listar las tareas:', e);
        return [];
    }
}
