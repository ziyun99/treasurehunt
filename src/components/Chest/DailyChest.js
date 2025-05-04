import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import BaseChest from './BaseChest';
import DailyCheckInModal from '../modals/DailyCheckInModal';
import { dailyChestQuotes } from '../../config/dailyChestQuotes';

export default function DailyChest({ 
  user,
  handleProgressUpdate
}) {
  const [showModal, setShowModal] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || '');
      }
    };
    fetchUserName();
  }, [user]);

  const checkIfCheckedInToday = async () => {
    if (!user) return;

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
      return true;
    }
    return false;
  };

  useEffect(() => {
    checkIfCheckedInToday();
  }, [user]);

  const handleClick = async () => {
    if (!user) return;

    const isCheckedInToday = await checkIfCheckedInToday();
    if (isCheckedInToday) return;

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
      handleProgressUpdate("dailyCheckIn");

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
        customIcon={isCheckedIn ? '/icons/chest-blue-light.gif' : '/icons/chest-blue.svg'}
        quotes={[dailyChestQuotes.getTodayQuote()]}
        userName={userName}
      />
      <DailyCheckInModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCheckIn={handleCheckIn}
      />
    </>
  );
} 