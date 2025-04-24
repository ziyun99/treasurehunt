import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GAME_RULES } from '../../config/gameRules';
import { updateDiamondPoints } from '../../utils/pointsManager';
import AnimatedChest from './AnimatedChest';
import { createPortal } from 'react-dom';

const quotes = [
  {
    text: "每一天的堅持都是成長的養分，每一次的打卡都是成功的印記。",
    author: "堅持者"
  },
  {
    text: "習慣的養成始於每天的堅持，成功的果實來自持續的耕耘。",
    author: "耕耘者"
  },
  {
    text: "今日的打卡是明日成功的基石，堅持不懈是通往夢想的階梯。",
    author: "築夢者"
  },
  {
    text: "每天進步一點點，累積起來就是巨大的改變。",
    author: "進步者"
  },
  {
    text: "堅持不是因為看到希望才堅持，而是因為堅持才能看到希望。",
    author: "希望者"
  }
];

export default function DailyChest({ user, diamondPoints, setDiamondPoints, setShowDiamondBonus, setDiamondBonusType }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
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

  useEffect(() => {
    if (showModal) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [showModal]);

  const handleCheckIn = async () => {
    if (!user || isCheckedIn) {
      setShowModal(true);
      return;
    }

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

  const modal = showModal ? createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '500px',
        padding: '2rem',
        borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>✨</div>
          {currentQuote && (
            <>
              <p style={{ 
                marginBottom: '1.5rem', 
                fontSize: '1.25rem', 
                fontWeight: 500,
                lineHeight: 1.6
              }}>
                "{currentQuote.text}"
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                — {currentQuote.author}
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => setShowModal(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  ) : null;

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
      {modal}
    </div>
  );
} 