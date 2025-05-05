import { doc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function updateLeaderboardEntry(userId, userData) {
  try {
    // Only include necessary data for leaderboard
    const leaderboardData = {
      name: userData.name || '匿名玩家',
      diamondPoints: userData.diamondPoints || 0,
      lastDiamondUpdated: userData.lastDiamondUpdated || new Date(),
    };

    // Update the leaderboard entry
    await setDoc(doc(db, 'leaderboard', userId), leaderboardData);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

export async function getLeaderboardData() {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const leaderboardQuery = query(
      leaderboardRef,
      orderBy('diamondPoints', 'desc')
    );
    const snapshot = await getDocs(leaderboardQuery);
    
    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
} 