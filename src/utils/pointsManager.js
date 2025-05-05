import { doc, updateDoc, Timestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GAME_RULES } from "../config/gameRules";
import { updateLeaderboardEntry } from './leaderboard';

export const updateDiamondPoints = async ({
  user,
  taskName,
  taskId,
  currentPoints,
  setDiamondPoints,
  setShowDiamondBonus,
  setdiamondBonusTask,
  setMessage,
  setIsSuccess
}) => {
  if (!user || !GAME_RULES.tasks[taskName]) return;

  const task = GAME_RULES.tasks[taskName];
  const newPoints = currentPoints + task.points;

  try {
    // Get current user data
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Update User document
    await updateDoc(userRef, {
      diamondPoints: newPoints,
      lastDiamondUpdated: Timestamp.now()
    });

    // Update leaderboard
    await updateLeaderboardEntry(user.uid, {
      ...userData,
      diamondPoints: newPoints,
      lastDiamondUpdated: Timestamp.now()
    });

    // Add diamond log entry
    const diamondLogRef = doc(db, "users", user.uid, "diamond_logs", Date.now().toString());
    const logData = {
      timestamp: new Date(),
      task: GAME_RULES.tasks[taskName].id,
      points: GAME_RULES.tasks[taskName].points
    };
    if (taskId) {
      logData.task_id = taskId;
    }
    console.log("updateDiamondPoints:diamond_logs", logData);
    await setDoc(diamondLogRef, logData);

    // Update local state
    setDiamondPoints(newPoints);
    setdiamondBonusTask(taskName);
    setShowDiamondBonus(true);
    setTimeout(() => setShowDiamondBonus(false), 2000);

    // Update message if message handlers are provided
    if (setMessage && setIsSuccess) {
      setMessage(task.message(task.points));
      setIsSuccess(true);
    }

    return newPoints;
  } catch (error) {
    console.error("Error updating diamond points:", error);
    return currentPoints;
  }
}; 