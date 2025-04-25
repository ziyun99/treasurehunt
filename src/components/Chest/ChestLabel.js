import React from 'react';

export default function ChestLabel({ 
  id, 
  type, 
  state, 
  customLabel = null 
}) {
  const getLabel = () => {
    if (customLabel) return customLabel;
    
    if (type === 'daily') {
      return state === 'completed' ? '今日簽到成功' : '每日簽到';
    }
    
    return '';
  };

  if (!getLabel()) return null;

  return (
    <div className="mt-2 text-center">
      <span className={`text-sm font-medium ${
        state === 'completed' ? 'text-green-600' : 
        state === 'locked' ? 'text-gray-600' : 
        'text-blue-600'
      }`}>
        {getLabel()}
      </span>
    </div>
  );
} 