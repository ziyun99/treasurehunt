import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { isAdmin } from '../utils/admin';
import { onAuthStateChanged } from 'firebase/auth';

export default function MenuBar() {
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('MenuBar - Auth state changed, user:', user);
      if (user) {
        console.log('MenuBar - Checking admin status for:', user.uid);
        try {
          const adminStatus = await isAdmin(user.uid);
          console.log('MenuBar - Admin status:', adminStatus);
          setIsAdminUser(adminStatus);
        } catch (error) {
          console.error('MenuBar - Error checking admin status:', error);
          setIsAdminUser(false);
        }
      } else {
        console.log('MenuBar - No user, setting isAdminUser to false');
        setIsAdminUser(false);
      }
    });

    return () => {
      console.log('MenuBar cleanup');
      unsubscribe();
    };
  }, []);

  console.log('MenuBar - Current isAdminUser state:', isAdminUser);

  const menuItems = [
    { path: '/', label: '首頁' },
    { path: '/map', label: '地圖' },
    { path: '/profile', label: '個人資料' },
    ...(isAdminUser ? [{ path: '/admin', label: '管理員面板' }] : [])
  ];

  console.log('MenuBar - Current menu items:', menuItems);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-900 to-purple-900 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                location.pathname === item.path
                  ? 'text-yellow-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 