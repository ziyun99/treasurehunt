import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { dailyChestQuotes } from '../../config/dailyChestQuotes';

const defaultQuotes = [
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

export default function QuoteModal({ isOpen, onClose, quotes = [], type = 'default', userName = '' }) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [sunSticker, setSunSticker] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const availableQuotes = quotes.length > 0 ? quotes : defaultQuotes;
      setCurrentQuote(availableQuotes[0]);
      setCurrentQuoteIndex(0);
      
      if (type === 'daily') {
        setSunSticker(dailyChestQuotes.getTodaySunSticker());
      }
    }
  }, [isOpen, type]);

  const getGradientStyle = () => {
    switch (type) {
      case 'landmark':
        return 'linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(249, 115, 22, 0.9))';
      case 'diamond':
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))';
      case 'daily':
        return 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 200, 0, 0.95) 30%, rgba(255, 150, 0, 0.95) 60%, rgba(255, 100, 0, 0.95) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))';
    }
  };

  const handleNextQuote = () => {
    const availableQuotes = quotes.length > 0 ? quotes : defaultQuotes;
    const nextIndex = (currentQuoteIndex + 1) % availableQuotes.length;
    setCurrentQuoteIndex(nextIndex);
    setCurrentQuote(availableQuotes[nextIndex]);
  };

  if (!isOpen) return null;

  const availableQuotes = quotes.length > 0 ? quotes : defaultQuotes;
  const showNextButton = availableQuotes.length > 1;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
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
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={showNextButton ? handleNextQuote : undefined}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          background: getGradientStyle(),
          color: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          cursor: showNextButton ? 'pointer' : 'default'
        }}
      >
        <div style={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {type === 'daily' ? (
            <>
              <motion.img 
                src={sunSticker} 
                alt="Sunny Day" 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
                style={{ 
                  width: '140px', 
                  height: '140px',
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                }} 
              />
              {userName && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Hi {userName}! 您今日已簽到咯～
                </motion.p>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              style={{ fontSize: '3rem', marginBottom: '1.5rem' }}
            >
              ✨
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ 
                marginBottom: currentQuote?.author ? '1.5rem' : '0', 
                fontSize: '1.25rem', 
                fontWeight: 500,
                lineHeight: 1.6,
                maxWidth: '90%',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              {type === 'daily' ? currentQuote?.text : `"${currentQuote?.text}"`}
            </motion.div>
          </AnimatePresence>
          {currentQuote?.author && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ 
                fontSize: '0.875rem', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontStyle: 'italic',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              — {currentQuote.author}
            </motion.p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'color 0.2s',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1
          }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>,
    document.body
  );
} 