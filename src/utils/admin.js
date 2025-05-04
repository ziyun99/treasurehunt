import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function isAdmin(uid) {
  try {
    console.log('Checking admin status for UID:', uid);
    const adminDoc = await getDoc(doc(db, 'admin', uid));
    console.log('Admin document exists:', adminDoc.exists());
    console.log('Admin document data:', adminDoc.data());
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 