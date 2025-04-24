import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import AnimatedChest from './AnimatedChest';
import ChestLabel from './ChestLabel';

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
  const [currentQuote, setCurrentQuote] = useState(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showModal && !currentQuote) {
      const availableQuotes = quotes.length > 0 ? quotes : BaseChest.defaultQuotes;
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      setCurrentQuote(availableQuotes[randomIndex]);
    }
  }, [showModal, quotes, currentQuote]);

  const handleClick = () => {
    if (state === 'completed') {
      setShowModal(true);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuote(null);
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
          onClick={handleCloseModal}
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
      style={position}
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
      {modal}
    </div>
  );
}

BaseChest.defaultQuotes = quotes; 