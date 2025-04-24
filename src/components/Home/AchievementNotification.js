import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import badges from "../../data/badges.json";

export default function AchievementNotification({ earned, prevEarned }) {
  const [showNotification, setShowNotification] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check for newly earned achievements
    if (earned && prevEarned) {
      if (earned.firstStep && !prevEarned.firstStep) {
        const badge = badges.find(b => b.id === 'firstStep');
        setAchievement(badge);
        setShowNotification(true);
      } else if (earned.halfWay && !prevEarned.halfWay) {
        const badge = badges.find(b => b.id === 'halfWay');
        setAchievement(badge);
        setShowNotification(true);
      } else if (earned.completed && !prevEarned.completed) {
        const badge = badges.find(b => b.id === 'completed');
        setAchievement(badge);
        setShowNotification(true);
      }
    }
  }, [earned, prevEarned]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  return (
    <>
      {showNotification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          <AnimatePresence>
            {achievement && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative z-[10000]"
              >
                <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-yellow-500 min-w-[320px] max-w-[90vw]">
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={`/icons/${achievement.icon}`}
                      alt={achievement.label}
                      className="w-20 h-20"
                    />
                    <div className="text-center">
                      <h3 className="font-bold text-2xl text-gray-800">成就解鎖！</h3>
                      <p className="text-gray-600 text-xl mt-3">{achievement.label}</p>
                      <p className="text-sm text-gray-500 mt-2">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
} 