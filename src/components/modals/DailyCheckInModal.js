import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function DailyCheckInModal({ isOpen, onClose, onCheckIn }) {
  if (!isOpen) return null;

  return createPortal(
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
          <p style={{ 
            marginBottom: '1.5rem', 
            fontSize: '1.25rem', 
            fontWeight: 500,
            lineHeight: 1.6
          }}>
            今日簽到（+5💎）
          </p>
          <button
            onClick={onCheckIn}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              background: 'white',
              color: 'rgba(99, 102, 241, 0.9)',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            簽到
          </button>
        </div>
        <button
          onClick={onClose}
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
  );
} 