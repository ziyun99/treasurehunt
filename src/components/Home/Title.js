import React from 'react';

export default function Title({ countdown }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-yellow-800 mb-2">黃金尋寶秘笈 4.0</h1>
      <p className="text-lg text-yellow-700">{countdown}</p>
    </div>
  );
} 