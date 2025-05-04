import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { GAME_RULES } from "../config/gameRules";

export const updateDiamondPoints = async ({
  user,
  taskId,
  currentPoints,
  setDiamondPoints,
  setShowDiamondBonus,
  setdiamondBonusTask,
  setMessage,
  setIsSuccess
}) => {
  if (!user || !GAME_RULES.tasks[taskId]) return;

  const task = GAME_RULES.tasks[taskId];
  const newPoints = currentPoints + task.points;

  // Update Firebase
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    diamondPoints: newPoints,
    lastDiamondUpdated: Timestamp.now()
  });

  // Update local state
  setDiamondPoints(newPoints);
  setdiamondBonusTask(taskId);
  setShowDiamondBonus(true);
  setTimeout(() => setShowDiamondBonus(false), 2000);

  // Update message if message handlers are provided
  if (setMessage && setIsSuccess) {
    setMessage(task.message(task.points));
    setIsSuccess(true);
  }

  return newPoints;
}; 