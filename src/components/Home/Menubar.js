import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import DiamondLogsModal from '../modals/DiamondLogsModal';

export default function Menubar({ user, isVertical = false }) {
  const navigate = useNavigate();
  const [showDiamondLogs, setShowDiamondLogs] = useState(false);

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
    </div>
  );
} 