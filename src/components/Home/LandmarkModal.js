import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function LandmarkModal({ user, activeLandmark, progress, onClose, onProgressUpdate }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset input and message when landmark changes
  useEffect(() => {
    setPasswordInput("");
    setMessage("");
    setIsSuccess(false);
  }, [activeLandmark]);

  const checkPassword = async () => {
    if (!user || activeLandmark == null) return;
    const ref = doc(db, "treasure_passwords", `${activeLandmark + 1}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const correctPassword = snap.data().keyword;
      if (passwordInput.trim() === correctPassword) {
        const newProgress = { ...progress, [activeLandmark]: true };
        onProgressUpdate(newProgress);
        await setDoc(doc(db, "users", user.uid), { progress: newProgress }, { merge: true });
        setMessage("✅ 通關成功！");
        setIsSuccess(true);
      } else {
        setMessage("❌ 密語錯誤，請再試一次");
        setIsSuccess(false);
      }
    } else {
      setMessage("⚠️ 此地標尚未設置密語");
      setIsSuccess(false);
    }
  };

  if (activeLandmark == null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  onClick={() => onClose()} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
              )}
              <button 
                onClick={isSuccess ? onClose : checkPassword} 
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