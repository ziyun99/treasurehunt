import React from 'react';
import '../../styles/fonts.css';

export default function Title({ countdown }) {
  return (
    <div className="text-center mb-4 sm:mb-6 md:mb-8 pt-4 sm:pt-6 md:pt-8">
      <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-['XingShu'] text-yellow-800 mb-2 px-4 sm:px-6 md:px-8">
        黃金尋寶秘笈
      </h1>
      {/* {countdown && (
        <p className="text-base sm:text-lg md:text-l text-yellow-700 sm:mt-4">
          {countdown}
        </p>
      )} */}
    </div>
  );
} 