import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import badges from "../../badges.json";

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
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <AnimatePresence>
        {showNotification && achievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3">
                <img
                  src={`/icons/${achievement.icon}`}
                  alt={achievement.label}
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">成就解鎖！</h3>
                  <p className="text-gray-600">{achievement.label}</p>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 