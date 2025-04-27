import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './styles/fonts.css';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-['XingShu'] text-yellow-800 text-center mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
          黃金尋寶秘笈
        </h1>
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            使用 Google 帳號登入
          </button>
        </div>
      </div>
    </div>
  );
} 