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
    "台灣-北北基",
    "台灣-桃竹苗",
    "台灣-中彰投雲",
    "台灣-嘉南",
    "台灣-高屏",
    "台灣-宜花東",
    "馬來西亞-北馬",
    "馬來西亞-中馬",
    "馬來西亞-南馬",
    "馬來西亞-東馬",
    "新加坡",
    "中國大陸",
    "香港",
    "美國",
    "英國",
    "法國",
    "越南",
    "南非",
    "澳洲",
    "其他"
  ];

  const helpers = [
    "台灣 01 雅瓶",
    "台灣 02 雅婷",
    "台灣 03 媖婕",
    "台灣 04 佳津",
    "台灣 05 若渝",
    "台灣 06 彩煌",
    "台灣 07 佳蓁",
    "台灣 08 麗珠",
    "台灣 09 玉純",
    "台灣 10 妤馨",
    "台灣 11 建良+瑞玲",
    "台灣 12 育驊",
    "台灣 13 庭雯",
    "台灣 14 淑貞+茉宸",
    "台灣 16 彩煌",
    "台灣 17 雅瓶",
    "台灣 18 麗珠+湘涵",
    "台灣 19 玉純",
    "台灣 20 媖婕",
    "台灣 21 育驊",
    "台灣 22 妤馨",
    "國際群組 15 Amy",
    "大馬 01 冰莹",
    "大馬 02 澄俊",
    "大馬 03 麗麗",
    "新加坡 04 艾鴒",
    "大馬 05 美清",
    "大馬 06 Isa",
    "大馬 07 美萍",
    "大馬 08 函澒",
    "新加坡 09 慧菁",
    "綜合 10 魏美玲",
    "大馬 11 媺思",
    "大馬 12 Eva",
    "大馬 13 淑君+文祥",
    "大馬 14 淑麗",
    "大馬 15 Rachel",
    "大馬 16 承沿玉莉",
    "綜合 17 魏美玲",
    "大馬 18 Isa",
    "大馬 19 Rachel",
    "大馬 20 澄俊",
    "大馬 21 麗麗",
    "香港內地 00 小敏+錢慧",
    "其它"
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
      email: user.email,
      profileCompleted: true,
      uid: user.uid
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
            {helpers.map((helper) => (
              <option key={helper} value={helper}>
                {helper}
              </option>
            ))}
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