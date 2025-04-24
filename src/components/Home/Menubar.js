import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Menubar({ user }) {
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
    <div className="flex justify-end mb-4">
      <button
        onClick={handleEditProfile}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-4"
      >
        編輯個人資料
      </button>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        登出
      </button>
    </div>
  );
} 