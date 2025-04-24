import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GAME_RULES } from "../config/gameRules";

export const updateDiamondPoints = async ({
  user,
  taskId,
  currentPoints,
  setDiamondPoints,
  setShowDiamondBonus,
  setDiamondBonusType,
  setMessage,
  setIsSuccess
}) => {
  if (!user || !GAME_RULES.tasks[taskId]) return;

  const task = GAME_RULES.tasks[taskId];
  const newPoints = currentPoints + task.points;

  // Update Firebase
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    diamondPoints: newPoints
  });

  // Update local state
  setDiamondPoints(newPoints);
  setDiamondBonusType(task.type);
  setShowDiamondBonus(true);
  setTimeout(() => setShowDiamondBonus(false), 2000);

  // Update message if message handlers are provided
  if (setMessage && setIsSuccess) {
    setMessage(task.message(task.points));
    setIsSuccess(true);
  }

  return newPoints;
}; 