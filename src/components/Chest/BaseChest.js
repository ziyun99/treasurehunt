import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedChest from './AnimatedChest';
import ChestLabel from './ChestLabel';
import QuoteModal from '../modals/QuoteModal';

const quotes = [
  {
    text: "每一次的探索都是心靈的冒險，每一次的發現都是智慧的結晶。",
    author: "探索者"
  },
  {
    text: "在知識的海洋中，每一滴汗水都是智慧的珍珠。",
    author: "智者"
  },
  {
    text: "好奇心是探索的鑰匙，堅持是成功的密碼。",
    author: "冒險家"
  },
  {
    text: "每一個密碼背後，都藏著一個等待被發現的故事。",
    author: "解謎者"
  },
  {
    text: "智慧不在於知道多少，而在於如何運用所學。",
    author: "導師"
  }
];

export default function BaseChest({
  id,
  type,
  state,
  position,
  size,
  onClick,
  onComplete,
  quotes = [],
  showHoverShadow = true,
  customIcon = null,
  customLabel = null
}) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    console.log('handleClick', type, state);
    e.stopPropagation();
    if (state === 'completed') {
      setShowModal(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getChestIcon = () => {
    if (customIcon) return customIcon;
    
    switch (state) {
      case 'locked':
        return '/icons/lock.svg';
      case 'open':
        return '/icons/chest-closed.svg';
      case 'completed':
        return '/icons/chest-open.svg';
      default:
        return '/icons/chest-closed.svg';
    }
  };

  return (
    <div 
      className="fixed z-20 cursor-pointer"
      style={position}
      onClick={handleClick}
    >
      <div className="relative">
        <AnimatedChest
          src={getChestIcon()}
          size={size}
          onClick={handleClick}
          isCheckedIn={state === 'completed'}
          showHoverShadow={showHoverShadow}
        />
        <ChestLabel
          id={id}
          type={type}
          state={state}
          customLabel={customLabel}
        />
      </div>
      <QuoteModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        quotes={quotes}
      />
    </div>
  );
}

BaseChest.defaultQuotes = quotes; 