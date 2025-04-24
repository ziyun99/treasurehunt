import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export default function Header({ user, userData }) {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">黃金尋寶秘笈 4.0</h1>
          {user && userData?.profileCompleted && (
            <div className="mt-2 text-gray-600 text-lg">
              {userData.name ? `歡迎回來，${userData.name}！` : '歡迎回來！'}
            </div>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2"
            >
              <span>✏️</span>
              <span>編輯個人資料</span>
            </button>
            <button 
              onClick={handleSignOut} 
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              登出
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSignIn} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <span>🔑</span>
            <span>Google 登入</span>
          </button>
        )}
      </div>
    </div>
  );
} 