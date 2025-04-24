import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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
          <AnimatePresence>
            {achievement && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative z-[10000]"
              >
                <div className="relative">
                  {/* Glowing effect */}
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 bg-yellow-300 rounded-full blur-lg animate-ping" />
                  
                  {/* Main content */}
                  <div className="relative bg-white rounded-lg shadow-lg p-8 border-l-4 border-yellow-500 min-w-[320px] max-w-[90vw]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse" />
                        <img
                          src={`/icons/${achievement.icon}`}
                          alt={achievement.label}
                          className="relative w-20 h-20"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-2xl text-gray-800">獲得徽章！</h3>
                        <p className="text-gray-600 text-xl mt-3">{achievement.label}</p>
                        <p className="text-sm text-gray-500 mt-2">{achievement.description}</p>
                      </div>
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