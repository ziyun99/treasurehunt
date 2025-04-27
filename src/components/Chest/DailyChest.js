import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import BaseChest from './BaseChest';
import DailyCheckInModal from '../modals/DailyCheckInModal';
import { updateDiamondPoints } from '../../utils/pointsManager';

export default function DailyChest({ 
  user,
  diamondPoints,
  setDiamondPoints,
  setShowDiamondBonus,
  setDiamondBonusType
}) {
  const [showModal, setShowModal] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleClick = async () => {
    if (!user) return;

    // Check if user has already checked in today
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const lastCheckIn = userData?.lastCheckIn?.toDate();
    const today = new Date();

    if (lastCheckIn && 
        lastCheckIn.getDate() === today.getDate() &&
        lastCheckIn.getMonth() === today.getMonth() &&
        lastCheckIn.getFullYear() === today.getFullYear()) {
      setIsCheckedIn(true);
      return;
    }

    setShowModal(true);
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      // Update last check-in time
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        lastCheckIn: new Date()
      }, { merge: true });

      // Update points
      await updateDiamondPoints({
        user,
        taskId: 'dailyCheckIn',
        currentPoints: diamondPoints,
        setDiamondPoints,
        setShowDiamondBonus,
        setDiamondBonusType
      });

      setIsCheckedIn(true);
      setShowModal(false);
    } catch (error) {
      console.error("Error during check-in:", error);
    }
  };

  return (
    <>
      <BaseChest
        type="daily"
        state={isCheckedIn ? 'completed' : 'open'}
        position={{ left: '20px', top: '20px' }}
        size={80}
        onClick={handleClick}
        showHoverShadow={!isCheckedIn}
        customIcon={isCheckedIn ? '/icons/chest-blue-light.svg' : '/icons/chest-blue.svg'}
        // customLabel={isCheckedIn ? '每日簽到（已完成）' : '每日簽到'}
      />
      <DailyCheckInModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCheckIn={handleCheckIn}
      />
    </>
  );
} 