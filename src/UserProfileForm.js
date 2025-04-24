import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

export default function UserProfileForm({ onClose }) {
  const user = getAuth().currentUser;
  const [formData, setFormData] = useState({ name: "", location: "", helper: "" });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const locations = [
    "台北市",
    "新北市",
    "桃園市",
    "台中市",
    "台南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義市",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "台東縣",
    "澎湖縣",
    "金門縣",
    "連江縣"
  ];

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          name: data.name || "",
          location: data.location || "",
          helper: data.helper || ""
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      ...formData,
      profileCompleted: true
    }, { merge: true });
    if (onClose) onClose();
  };

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">請填寫個人資料</h2>
        <div className="space-y-1 mt-2">
          <div className="text-sm text-gray-500">
            電子郵件: {user?.email}
          </div>
          <div 
            onClick={copyToClipboard}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-sm text-gray-500">
              ID: {user?.uid}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
              />
            </svg>
            <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {copied ? '已複製!' : '點擊複製'}
            </span>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">姓名</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">所在地區</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">請選擇地區</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">所屬小幫手</label>
          <select
            name="helper"
            value={formData.helper}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">請選擇</option>
            <option value="A">小幫手 A</option>
            <option value="B">小幫手 B</option>
            <option value="C">小幫手 C</option>
            <option value="D">小幫手 D</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          儲存資料
        </button>
      </form>
    </div>
  );
}