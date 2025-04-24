import { useState, useEffect } from 'react';
import { GAME_RULES } from '../../config/gameRules';
import { updateDiamondPoints } from '../../utils/pointsManager';
import BaseChest from './BaseChest';

const dailyQuotes = [
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

  const getPosition = () => {
    const baseX = 0.25; // 25% from left
    const baseY = 0.25; // 25% from top
    const offset = 50; // Smaller offset for better positioning

    if (isPortrait) {
      return {
        left: `${baseX * viewportSize.width}px`,
        top: `${baseY * viewportSize.height - offset}px`
      };
    } else {
      return {
        left: `${baseX * viewportSize.width - offset}px`,
        top: `${baseY * viewportSize.height}px`
      };
    }
  };

  const getChestSize = () => {
    const baseSize = 80;
    const baseViewportSize = 800; // Base viewport width for scaling
    const scale = Math.min(
      Math.max(viewportSize.width / baseViewportSize, 1), // Minimum scale of 1
      1.5 // Maximum scale of 1.5
    );
    return baseSize * scale;
  };

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

  return (
    <div className="relative">
      {showSuccessMessage && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white/90 text-green-600 text-sm font-medium px-4 py-2 rounded-lg shadow-lg min-w-[140px] text-center whitespace-nowrap">
            <div>✅ 簽到成功！</div>
            <div>+{GAME_RULES.tasks.dailyCheckIn.points} 💎</div>
          </div>
        </div>
      )}
      <BaseChest
        id={0}
        type="daily"
        state={isCheckedIn ? 'completed' : 'open'}
        position={getPosition()}
        size={getChestSize()}
        onClick={handleCheckIn}
        quotes={dailyQuotes}
        showHoverShadow={false}
        customIcon={`/icons/${isCheckedIn ? 'chest-blue-light.svg' : 'chest-blue.svg'}`}
        customLabel={isCheckedIn ? '今日簽到成功' : '每日簽到'}
      />
    </div>
  );
} 