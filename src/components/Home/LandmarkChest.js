import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import BaseChest from "./BaseChest";

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

export default function LandmarkChest({ 
  id, 
  cx, 
  cy, 
  scale = 1,
  progress, 
  unlockedIndex, 
  onClickMarker 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (showModal) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [showModal]);

  const iconSize = 80 * scale;
  const iconOffset = iconSize / 2;
  const textOffset = 50 * scale;
  const fontSize = 13 * scale;

  const getState = () => {
    if (id > unlockedIndex) {
      return 'locked';
    } else if (progress[id]) {
      return 'completed';
    } else {
      return 'open';
    }
  };

  const handleClick = () => {
    if (progress[id]) return;
    onClickMarker(id);
  };

  const getChestIcon = () => {
    switch (getState()) {
      case 'locked':
        return `${process.env.PUBLIC_URL}/icons/lock.svg`;
      case 'open':
        return `${process.env.PUBLIC_URL}/icons/chest-closed.svg`;
      case 'completed':
        return `${process.env.PUBLIC_URL}/icons/chest-open.svg`;
      default:
        return `${process.env.PUBLIC_URL}/icons/chest-closed.svg`;
    }
  };

  const getPosition = () => ({
    left: `${cx - iconOffset}px`,
    top: `${cy - iconOffset}px`
  });

  console.log('Rendering Hotspot:', id, 'ShowModal:', showModal, 'Progress:', progress[id]);

  const modal = showModal && progress[id] ? createPortal(
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
    <>
      <g key={`group-${id}`} className={isVisible ? "opacity-100" : "opacity-0"}>
        <g transform={`translate(${cx}, ${cy})`}>
          {getState() === 'locked' ? (
            <image
              href={getChestIcon()}
              x={-iconOffset}
              y={-iconOffset}
              width={iconSize}
              height={iconSize}
              className="cursor-not-allowed"
            />
          ) : (
            <foreignObject x={-iconOffset} y={-iconOffset} width={iconSize} height={iconSize}>
              <div className="w-full h-full" onClick={handleClick}>
                <BaseChest
                  id={id}
                  type="landmark"
                  state={getState()}
                  position={{ left: 0, top: 0 }}
                  size={iconSize}
                  onClick={handleClick}
                />
              </div>
            </foreignObject>
          )}
        </g>
        <text
          x={cx}
          y={cy + textOffset}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="500"
          fontFamily="Segoe UI, sans-serif"
          fill="#fff"
          filter="url(#textShadow)"
          className="transition-opacity duration-300"
        >
          {getState() === 'locked' ? `地標 ${id + 1}（未解鎖）` :
           getState() === 'completed' ? `地標 ${id + 1}（通關成功）` :
           `地標 ${id + 1}（未通關）`}
        </text>
      </g>
      {modal}
    </>
  );
} 