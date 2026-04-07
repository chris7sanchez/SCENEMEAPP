import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.privateKey) {
    console.error("No private key found in .env");
    process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function checkOrders() {
    console.log("Checking orders collection for project:", serviceAccount.projectId);
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    
    if (snapshot.empty) {
        console.log("No orders found.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Order ID: ${doc.id}`);
        console.log(`- Status: ${data.status}`);
        console.log(`- Client: ${data.contact?.name || 'Unknown'}`);
        console.log(`- Total: ${data.totalAmount}€`);
        console.log(`- CreatedAt: ${data.createdAt?.toDate().toISOString() || 'N/A'}`);
        console.log('---');
    });
}

checkOrders().catch(console.error);
