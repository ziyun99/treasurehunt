import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { auth } from '../../firebase';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [peerUsers, setPeerUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // First, get all users to find current user's rank
      const allUsersRef = collection(db, "users");
      const allUsersQuery = query(
        allUsersRef, 
        orderBy("diamondPoints", "desc")
      );
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      // Process users and handle missing lastDiamondUpdated
      const allUsers = allUsersSnapshot.docs.map((doc, index) => {
        const data = doc.data();
        // If lastDiamondUpdated doesn't exist, use a very large timestamp (year 3000)
        if (!data.lastDiamondUpdated) {
          data.lastDiamondUpdated = { 
            seconds: 32503680000, // January 1, 3000
            nanoseconds: 0 
          };
        }
        return {
          id: doc.id,
          rank: index + 1,
          ...data
        };
      });

      // Sort users by diamondPoints and lastDiamondUpdated in memory
      allUsers.sort((a, b) => {
        if (a.diamondPoints !== b.diamondPoints) {
          return b.diamondPoints - a.diamondPoints;
        }
        // For users with same points, earlier timestamp gets higher rank
        return a.lastDiamondUpdated.seconds - b.lastDiamondUpdated.seconds;
      });

      // Update ranks after sorting
      allUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Find current user's data
      const userData = allUsers.find(user => user.id === currentUser.uid);
      if (userData) {
        setCurrentUserRank(userData.rank);
        setCurrentUserData(userData);

        // Get peers around current user (2 above and 2 below)
        if (userData.rank > 10) {
          const startIndex = Math.max(0, userData.rank - 3); // -3 to get 2 above
          const endIndex = Math.min(allUsers.length, userData.rank + 2); // +2 to get 2 below
          const peers = allUsers.slice(startIndex, endIndex);
          setPeerUsers(peers);
        }
      }

      // Get top 10 users
      const topUsers = allUsers.slice(0, 10);
      setUsers(topUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard();
  };

  if (!isOpen) return null;

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  const isCurrentUserInTop10 = currentUserData && users.some(user => user.id === currentUserData.id);

  const renderUserRow = (user, isCurrentUser = false) => {
    // Format the lastDiamondUpdated time
    const formatTime = (timestamp) => {
      if (!timestamp || !timestamp.seconds) return '從未更新';
      // Check if it's our default future timestamp (year 3000)
      if (timestamp.seconds === 32503680000) return '從未更新';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div
        key={user.id}
        style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isCurrentUser ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
          borderRadius: '0.5rem',
          marginBottom: '0.5rem'
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ 
            width: '24px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            {getRankEmoji(user.rank)}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>
              {user.name || '匿名玩家'}
              {isCurrentUser && (
                <span style={{ 
                  marginLeft: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#fbbf24'
                }}>
                  (你)
                </span>
              )}
            </div>
            <div style={{ 
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '0.25rem'
            }}>
              最後更新: {formatTime(user.lastDiamondUpdated)}
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#fbbf24'
        }}>
          💎 {user.diamondPoints || 0}
        </div>
      </div>
    );
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
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🏆</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600,
              margin: 0
            }}>
              鑽石排行榜
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                opacity: isRefreshing ? 0.5 : 1
              }}
              className="hover:opacity-80"
              title="更新排行榜"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          {currentUserRank && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              display: 'inline-block'
            }}>
              <span style={{ fontWeight: 500 }}>你的排名: </span>
              <span style={{ fontWeight: 600, color: '#fbbf24' }}>#{currentUserRank}</span>
            </div>
          )}
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
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              還沒有任何記錄
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.5rem'
                }}>
                  排行榜
                </div>
                {users.map(user => renderUserRow(user, user.id === currentUserData?.id))}
              </div>
              
              {!isCurrentUserInTop10 && peerUsers.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ 
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.5rem'
                  }}>
                    你的排名附近
                  </div>
                  {peerUsers.map(user => renderUserRow(user, user.id === currentUserData?.id))}
                </div>
              )}
            </>
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