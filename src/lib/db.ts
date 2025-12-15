import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import { FormData } from "./types";

export interface OrderData extends FormData {
    userId: string;
    status: 'pending' | 'deposit_paid' | 'paid_in_full' | 'completed' | 'cancelled';
    createdAt: any;
    totalAmount: number;
    depositAmount: number;
    remainingAmount: number;
    paymentMethod: string;
}

export const createOrder = async (formData: FormData, totalAmount: number, depositAmount: number, paymentMethod: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const orderData = {
        ...formData,
        userId: user.uid,
        status: 'deposit_paid',
        createdAt: serverTimestamp(),
        totalAmount: totalAmount,
        depositAmount: depositAmount,
        remainingAmount: totalAmount - depositAmount,
        paymentMethod: paymentMethod,
        // Sanitize undefined values to null for Firestore
        shootDate: formData.shootDate ? formData.shootDate.toISOString() : null,
        preferredMonths: formData.preferredMonths || []
    };

    try {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Order written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};
