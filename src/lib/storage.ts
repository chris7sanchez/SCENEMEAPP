import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFile(file: File, path: string): Promise<string> {
    if (!file) return "";

    try {
        // Create a reference to the file location
        // e.g., "avatars/user123/profile.jpg"
        const storageRef = ref(storage, path);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/avatar.${extension}`;
    return uploadFile(file, path);
}

export async function uploadSceneMaterial(userId: string, sceneId: string, file: File, type: 'script' | 'reference'): Promise<string> {
    const path = `users/${userId}/scenes/${sceneId}/${type}_${file.name}`;
    return uploadFile(file, path);
}
