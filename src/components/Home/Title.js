import React from 'react';
import '../../styles/fonts.css';

export default function Title({ countdown, progress }) {
  // Calculate completed landmarks and diamond chests
  const completedLandmarks = progress?.landmark ? Object.values(progress.landmark).filter(Boolean).length : 0;
  const completedDiamondChests = progress?.diamond ? Object.values(progress.diamond).filter(Boolean).length : 0;

  return (
    <div className="text-center mb-4 sm:mb-6 md:mb-8 pt-4 sm:pt-6 md:pt-8 portrait:pt-2">
      <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-6xl font-['XingShu'] text-yellow-800 mb-2 px-4 sm:px-6 md:px-8 whitespace-nowrap">
        黃金尋寶秘笈
      </h1>
      <div className="flex justify-center items-center gap-4 sm:gap-6 mt-2">
        <span className="text-yellow-800 font-medium">宝箱: {completedLandmarks}/7 | 钻石: {completedDiamondChests}/3</span>
      </div>
      {/* {countdown && (
        <p className="text-base sm:text-lg md:text-l text-yellow-700 sm:mt-4">
          {countdown}
        </p>
      )} */}
    </div>
  );
} 