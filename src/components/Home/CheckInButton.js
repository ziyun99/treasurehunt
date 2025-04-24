import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { GAME_RULES } from "../../config/gameRules";
import { motion, AnimatePresence } from "framer-motion";
import { updateDiamondPoints } from "../../utils/pointsManager";

export default function CheckInButton({ user, diamondPoints, setDiamondPoints, setShowDiamondBonus, setDiamondBonusType }) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (user) {
      checkDailyStatus();
    }
  }, [user]);

  const checkDailyStatus = async () => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn;
      
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn.seconds * 1000);
        const today = new Date();
        
        // Check if last check-in was today
        if (
          lastCheckInDate.getDate() === today.getDate() &&
          lastCheckInDate.getMonth() === today.getMonth() &&
          lastCheckInDate.getFullYear() === today.getFullYear()
        ) {
          setIsCheckedIn(true);
        }
      }
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn;
      
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn.seconds * 1000);
        const today = new Date();
        
        // Check if already checked in today
        if (
          lastCheckInDate.getDate() === today.getDate() &&
          lastCheckInDate.getMonth() === today.getMonth() &&
          lastCheckInDate.getFullYear() === today.getFullYear()
        ) {
          setMessage(GAME_RULES.errorMessages.alreadyCheckedIn);
          setIsSuccess(false);
          return;
        }
      }
      
      // Update last check-in time
      await updateDoc(userRef, {
        lastCheckIn: new Date()
      });

      // Update points using the points manager
      await updateDiamondPoints({
        user,
        taskId: 'dailyCheckIn',
        currentPoints: diamondPoints,
        setDiamondPoints,
        setShowDiamondBonus,
        setDiamondBonusType,
        setMessage,
        setIsSuccess
      });
      
      setIsCheckedIn(true);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleCheckIn}
        disabled={isCheckedIn}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 overflow-hidden ${
          isCheckedIn
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
        }`}
        whileHover={!isCheckedIn ? { scale: 1.05 } : {}}
        whileTap={!isCheckedIn ? { scale: 0.95 } : {}}
      >
        <div className="flex items-center gap-2">
          {isCheckedIn ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>今日已簽到</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>每日簽到 +{GAME_RULES.tasks.dailyCheckIn.points} 💎</span>
            </>
          )}
        </div>
        
        {!isCheckedIn && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-12 left-0 w-full text-center"
          >
            <div className="bg-white text-blue-600 text-sm font-medium px-3 py-1 rounded-lg shadow-lg">
              +{GAME_RULES.tasks.dailyCheckIn.points} 💎
            </div>
          </motion.div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg ${
              isSuccess 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 