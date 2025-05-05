import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import './styles/fonts.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [activeTab, setActiveTab] = useState('google'); // 'google' or 'email'

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setGoogleError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setGoogleError('Google 登入失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setEmailError('');
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Error with email auth:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setEmailError('此電子郵件已被註冊');
          break;
        case 'auth/invalid-email':
          setEmailError('無效的電子郵件格式');
          break;
        case 'auth/operation-not-allowed':
          setEmailError('此登入方式尚未啟用');
          break;
        case 'auth/weak-password':
          setEmailError('密碼強度不足');
          break;
        case 'auth/user-disabled':
          setEmailError('此帳號已被停用');
          break;
        case 'auth/user-not-found':
          setEmailError('找不到此帳號');
          break;
        case 'auth/wrong-password':
          setEmailError('密碼錯誤');
          break;
        default:
          setEmailError('登入失敗，請再試一次');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setEmailError('請輸入電子郵件');
      return;
    }
    try {
      setLoading(true);
      setEmailError('');
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // This will redirect back to login page after reset
        handleCodeInApp: true
      });
      setResetSent(true);
    } catch (error) {
      console.error('Error sending password reset:', error);
      setEmailError('重設密碼郵件發送失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-['XingShu'] text-yellow-800 text-center mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
          黃金尋寶秘笈
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center font-medium text-sm ${
              activeTab === 'google'
                ? 'text-yellow-600 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('google')}
          >
            Google 登入
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-medium text-sm ${
              activeTab === 'email'
                ? 'text-yellow-600 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            電子郵件登入
          </button>
        </div>

        <div className="space-y-4">
          {/* Google Sign In */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                使用 Google 帳號登入
              </button>
              <div className="text-center mb-4">
                <p className="text-blue-600 mb-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  推薦使用 Google 帳號登入
                </p>
                <p className="text-blue-600 mb-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  快速、安全，無需記住密碼
                </p>
              </div>
              {googleError && (
                <div className="text-red-500 text-sm text-center">{googleError}</div>
              )}
            </div>
          )}

          {/* Email Sign In */}
          {activeTab === 'email' && (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="電子郵件"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密碼"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                {emailError && (
                  <div className="text-red-500 text-sm text-center">{emailError}</div>
                )}
                {resetSent && (
                  <div className="text-green-500 text-sm text-center">
                    重設密碼郵件已發送，請檢查您的信箱
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  {loading ? '處理中...' : isSignUp ? '註冊' : '登入'}
                </button>
              </form>

              <div className="flex flex-col items-center space-y-2 text-sm">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  {isSignUp ? '已有帳號？登入' : '沒有帳號？註冊'}
                </button>
                {!isSignUp && (
                  <button
                    onClick={handlePasswordReset}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    忘記密碼？
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 