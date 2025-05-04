import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function DiamondLogsModal({ isOpen, onClose, user }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      
      try {
        const logsRef = collection(db, "users", user.uid, "diamond_logs");
        const q = query(logsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const logsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching diamond logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          maxHeight: '80vh',
          padding: '2rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))',
          color: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>💎</div>
          <h2 style={{ 
            marginBottom: '1rem', 
            fontSize: '1.5rem', 
            fontWeight: 600
          }}>
            我的鑽石記錄
          </h2>
        </div>

        <div style={{ 
          maxHeight: '50vh',
          overflowY: 'auto',
          padding: '1rem',
          marginTop: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.5rem'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              載入中...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              還沒有任何鑽石記錄
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {formatDate(log.timestamp)}
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    {log.task === 'diamondChest' ? '鑽石寶箱' : 
                     log.task === 'landmarkUnlock' ? '解鎖地標' : 
                     log.task === 'dailyCheckIn' ? '每日簽到' : log.task}
                    {log.task_id && `${log.task_id}`}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#fbbf24'
                }}>
                  +{log.points}
                </div>
              </div>
            ))
          )}
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
      </motion.div>
    </div>,
    document.body
  );
} 