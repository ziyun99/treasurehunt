import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Confetti from "react-confetti";
import { GAME_RULES } from "../../config/gameRules";

export default function LandmarkModal({ user, activeLandmark, progress, onClose, onProgressUpdate }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  const [isFirstUnlock, setIsFirstUnlock] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset input and message when landmark changes
  useEffect(() => {
    setPasswordInput("");
    setMessage("");
    // Only reset isSuccess if we're not in a success state
    if (!isSuccess) {
      setIsSuccess(false);
    }
  }, [activeLandmark]);

  const handleClose = () => {
    setIsSuccess(false);
    setIsFirstUnlock(false);
    onClose();
  };

  const checkPassword = async () => {
    if (!user || activeLandmark == null) return;
    const ref = doc(db, "treasure_passwords", `${activeLandmark + 1}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const correctPassword = snap.data().keyword;
      const correctPassword1 = snap.data().keyword1;
      if (passwordInput.trim() === correctPassword || passwordInput.trim() === correctPassword1) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`progress.landmark.${activeLandmark}`]: true
        });
        onProgressUpdate("landmarkUnlock");

        // Check if this is the first unlock
        const firstUnlock = !progress?.[activeLandmark];
        setIsFirstUnlock(firstUnlock);
        
        const successMessage = firstUnlock 
          ? GAME_RULES.tasks.landmarkUnlock.message(GAME_RULES.tasks.landmarkUnlock.points)
          : "✅ 通關成功！";
        
        setMessage(successMessage);
        setIsSuccess(true);

        // If it's a first unlock, delay closing the modal
        if (firstUnlock) {
          setTimeout(() => {
            handleClose();
          }, 5000); // Show for 5 seconds
        }
      } else {
        setMessage(GAME_RULES.errorMessages.wrongPassword);
        setIsSuccess(false);
      }
    } else {
      setMessage(GAME_RULES.errorMessages.noPassword);
      setIsSuccess(false);
    }
  };

  if (activeLandmark == null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {isSuccess && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">地標 {activeLandmark + 1} 通關密語</h2>
          <div className="space-y-4">
            {!isSuccess && (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="請輸入通關密語"
              />
            )}
            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes("成功") ? "bg-green-50 text-green-800" :
                message.includes("錯誤") ? "bg-red-50 text-red-800" :
                "bg-yellow-50 text-yellow-800"
              }`}>
                {message}
              </div>
            )}
            <div className="flex justify-end gap-3">
              {!isSuccess && (
                <button 
                  onClick={handleClose} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
              )}
              <button 
                onClick={isSuccess ? handleClose : checkPassword} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {isSuccess ? "關閉" : "確認"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 