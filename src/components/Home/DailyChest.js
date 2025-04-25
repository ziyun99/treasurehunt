import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GAME_RULES } from '../../config/gameRules';
import { updateDiamondPoints } from '../../utils/pointsManager';
import BaseChest from './BaseChest';

const dailyQuotes = [
  {
    text: "每天都是一個新的開始，每一次的簽到都是對未來的承諾。",
    author: "冒險者"
  },
  {
    text: "堅持不懈的簽到，是通往寶藏的第一步。",
    author: "探險家"
  },
  {
    text: "今天的簽到，是明天成功的基石。",
    author: "智者"
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
    const { width, height } = viewportSize;
    
    if (isPortrait) {
      // Position before chest0 in portrait mode
      const horizontalMargin = width * 0.15;
      const verticalMargin = height * 0.2;
      const verticalSpacing = (height - 2 * verticalMargin) / 6; // 6 because we have 7 chests
      const centerX = width / 2;
      const baseAmplitude = (width - 2 * horizontalMargin) / 3;
      
      // Use a variation that places it before chest0
      const variation = { amplitude: 1.1, phase: 0.1 };
      const y = verticalMargin; // Position above chest0
      
      const amplitude = baseAmplitude * variation.amplitude;
      const phase = variation.phase;
      const horizontalSpacing = width / 4; // 4 for portait horizontal spacing
      const x = centerX + amplitude * Math.sin(0 + phase) - horizontalSpacing; // Start of the wave pattern
      
      return { cx: x, cy: y };
    } else {
      // Position before chest0 in landscape mode
      const verticalMargin = height * 0.15;
      const horizontalSpacing = width / 8; // 8 because we have 7 chests + 1 for spacing
      const centerY = height / 2;
      const baseAmplitude = (height - 2 * verticalMargin) / 3;
      
      // Use a variation that places it before chest0
      const variation = { amplitude: 1.1, phase: 0.1, offset: 15 };
      const x = horizontalSpacing; // Position before chest0
      const amplitude = baseAmplitude * variation.amplitude;
      const phase = variation.phase;
      const verticalOffset = variation.offset;
      const verticalSpacing = height / 4; // 6 because we have 7 chests
      const y = centerY + amplitude * Math.sin(0 + phase) + verticalOffset - verticalSpacing; // Start of the wave pattern
      
      return { cx: x, cy: y };
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
    console.log('Checkin button clicked');
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

  const position = getPosition();
  const size = getChestSize();

  return (
    <div className="absolute inset-0 z-10">
      <svg 
        viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        <g transform={`translate(${position.cx}, ${position.cy})`}>
          <foreignObject 
            x={-size/2} 
            y={-size/2} 
            width={size} 
            height={size}
            style={{ overflow: 'visible' }}
          >
            <div 
              className="w-full h-full cursor-pointer"
              onClick={handleCheckIn}
              style={{ 
                pointerEvents: isCheckedIn ? 'none' : 'auto',
                opacity: isCheckedIn ? 0.7 : 1
              }}
            >
              <BaseChest
                id={0}
                type="daily"
                state={isCheckedIn ? 'completed' : 'open'}
                position={{ left: 0, top: 0 }}
                size={size}
                onClick={handleCheckIn}
                quotes={dailyQuotes}
                showHoverShadow={!isCheckedIn}
                customIcon={`/icons/${isCheckedIn ? 'chest-blue-light.svg' : 'chest-blue.svg'}`}
                customLabel={isCheckedIn ? '今日簽到成功' : '每日簽到'}
              />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
} 