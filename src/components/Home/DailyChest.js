import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GAME_RULES } from '../../config/gameRules';
import { updateDiamondPoints } from '../../utils/pointsManager';
import AnimatedChest from './AnimatedChest';

export default function DailyChest({ user, diamondPoints, setDiamondPoints, setShowDiamondBonus, setDiamondBonusType }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      const checkInStatus = localStorage.getItem(`dailyCheckIn_${user.uid}`);
      if (checkInStatus) {
        const lastCheckIn = new Date(checkInStatus);
        const today = new Date();
        if (lastCheckIn.toDateString() === today.toDateString()) {
          setIsCheckedIn(true);
        }
      }
    }
  }, [user]);

  const handleCheckIn = async () => {
    if (!user || isCheckedIn) return;

    try {
      setIsCheckedIn(true);
      setShowSuccessMessage(true);
      localStorage.setItem(`dailyCheckIn_${user.uid}`, new Date().toISOString());
      
      await updateDiamondPoints({
        user,
        taskId: 'dailyCheckIn',
        currentPoints: diamondPoints,
        setDiamondPoints,
        setShowDiamondBonus,
        setDiamondBonusType,
        setMessage: () => {},
        setIsSuccess: () => {}
      });

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    } catch (error) {
      console.error("Check-in failed:", error);
      setIsCheckedIn(false);
    }
  };

  // Calculate position based on viewport size and orientation
  const getPosition = () => {
    const baseX = 200; // First chest x coordinate
    const baseY = 200; // First chest y coordinate
    const offset = 100; // Offset from the first chest

    if (isPortrait) {
      return {
        left: `${(baseX / 800) * viewportSize.width}px`,
        top: `${(baseY / 600) * viewportSize.height - offset}px`
      };
    } else {
      return {
        left: `${(baseX / 800) * viewportSize.width - offset}px`,
        top: `${(baseY / 600) * viewportSize.height}px`
      };
    }
  };

  return (
    <div 
      className="fixed z-20"
      style={getPosition()}
    >
      <div className="relative">
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white/90 text-green-600 text-sm font-medium px-4 py-2 rounded-lg shadow-lg min-w-[140px] text-center whitespace-nowrap">
              <div>✅ 簽到成功！</div>
              <div>+{GAME_RULES.tasks.dailyCheckIn.points} 💎</div>
            </div>
          </motion.div>
        )}
        <AnimatedChest
          src={`/icons/${isCheckedIn ? 'chest-blue-light.svg' : 'chest-blue.svg'}`}
          size={80}
          onClick={handleCheckIn}
          isCheckedIn={isCheckedIn}
          showHoverShadow={false}
        />
        <div className="mt-2 text-center">
          <span className={`text-sm font-medium ${isCheckedIn ? 'text-green-600' : 'text-blue-600'}`}>
            {isCheckedIn ? '今日打卡成功' : '每日打卡'}
          </span>
        </div>
      </div>
    </div>
  );
} 