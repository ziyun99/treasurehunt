import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Menubar({ user, isVertical = false }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div className={`${isVertical ? 'flex flex-col space-y-2' : 'flex justify-end space-x-4'}`}>
      <button
        onClick={handleEditProfile}
        className={`${isVertical ? 'w-full' : ''} bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
      >
        編輯個人資料
      </button>
      <button
        onClick={handleLogout}
        className={`${isVertical ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
      >
        登出
      </button>
    </div>
  );
} 