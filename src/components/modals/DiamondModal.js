import { useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function DiamondModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  handleProgressUpdate
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await onSubmit(password);
      if (success) {
        console.log("diamondChest success");
      } else {
        setError('密碼錯誤，請再試一次');
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          padding: '2rem',
          borderRadius: '1.5rem',
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(79, 70, 229, 0.95))',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1.5rem',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
          }}>💎</div>
          <h2 style={{ 
            marginBottom: '1rem', 
            fontSize: '1.75rem', 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            鑽石寶箱
          </h2>
          <p style={{ 
            marginBottom: '1.5rem', 
            fontSize: '1.1rem', 
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            輸入密碼來開啟寶箱
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '1.1rem',
                marginBottom: '1rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              placeholder="輸入密碼"
              disabled={isSubmitting}
            />
            {error && (
              <p style={{ 
                color: '#ff6b6b', 
                marginBottom: '1rem',
                fontSize: '0.875rem',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.95)',
                color: 'rgba(79, 70, 229, 0.95)',
                fontWeight: 600,
                fontSize: '1.1rem',
                transition: 'all 0.2s',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              {isSubmitting ? '開啟中...' : '開啟寶箱'}
            </button>
          </form>
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            padding: '0.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </div>,
    document.body
  );
} 