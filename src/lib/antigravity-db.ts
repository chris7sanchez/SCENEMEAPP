'use client';

import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import { db, auth as firebaseAuth } from './firebase';

export interface AntigravityState {
    userBirthData?: any;
    userLibrary?: any[];
    friends?: any[];
    scriptLibrary?: any[];
    themeSettings?: any;
    customKnowledge?: any[];
}

const COLLECTION = 'users';
const SUBCOLLECTION = 'antigravity';
const DOC_ID = 'state';

// Returns the Firestore ref for the current user's Antigravity state.
// Path: users/{uid}/antigravity/state
function getRef(firestore: Firestore, uid: string) {
    return doc(firestore, COLLECTION, uid, SUBCOLLECTION, DOC_ID);
}

export async function loadAntigravityState(): Promise<AntigravityState | null> {
    if (!firebaseAuth || !db) return null; // Firebase no configurado → modo local
    const user = firebaseAuth.currentUser;
    if (!user) return null;

    try {
        const snap = await getDoc(getRef(db, user.uid));
        return snap.exists() ? (snap.data() as AntigravityState) : null;
    } catch (e) {
        console.error('[Antigravity DB] Error loading state:', e);
        return null;
    }
}

export async function saveAntigravityState(state: Partial<AntigravityState>): Promise<void> {
    if (!firebaseAuth || !db) return; // Firebase no configurado → modo local
    const user = firebaseAuth.currentUser;
    if (!user) return;

    try {
        // merge: true ensures partial saves don't wipe other fields
        await setDoc(getRef(db, user.uid), {
            ...state,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error('[Antigravity DB] Error saving state:', e);
    }
}
