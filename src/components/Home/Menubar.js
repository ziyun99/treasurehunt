import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import DiamondLogsModal from '../modals/DiamondLogsModal';
import LeaderboardModal from '../modals/LeaderboardModal';
import { isAdmin } from '../../utils/admin';
import { onAuthStateChanged } from 'firebase/auth';

export default function Menubar({ user, isVertical = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDiamondLogs, setShowDiamondLogs] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminStatus = await isAdmin(user.uid);
          setIsAdminUser(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      label: '鑽石排行榜',
      icon: '🏆',
      onClick: () => setShowLeaderboard(true),
      className: 'hover:bg-indigo-100/50'
    },
    {
      label: '查看鑽石記錄',
      icon: '💎',
      onClick: () => setShowDiamondLogs(true),
      className: 'hover:bg-indigo-100/50'
    },
    {
      label: '編輯個人資料',
      icon: '👤',
      onClick: () => navigate('/profile'),
      className: 'hover:bg-indigo-100/50'
    },
    ...(isAdminUser ? [{
      label: '管理員面板',
      icon: '⚙️',
      onClick: () => navigate('/admin'),
      className: 'hover:bg-indigo-100/50'
    }] : []),
    {
      label: '登出',
      icon: '🚪',
      onClick: handleLogout,
      className: 'hover:bg-indigo-100/50'
    }
  ];

  if (isVertical) {
    return (
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:text-indigo-600 ${item.className}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        <DiamondLogsModal 
          isOpen={showDiamondLogs}
          onClose={() => setShowDiamondLogs(false)}
          user={user}
        />
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:text-indigo-600 ${item.className}`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
      <DiamondLogsModal 
        isOpen={showDiamondLogs}
        onClose={() => setShowDiamondLogs(false)}
        user={user}
      />
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
} 