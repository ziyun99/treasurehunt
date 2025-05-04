import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

export default function UserProfileForm({ onClose }) {
  const user = getAuth().currentUser;
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    helper: "",
    secretCodeYear: "",
    phoneNumber: "",
    countryCode: "+886" // Default to Taiwan
  });
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

  const secretCodeYears = [
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025"
  ];

  const countryCodes = [
    { code: "+886", country: "台灣" },
    { code: "+60", country: "馬來西亞" },
    { code: "+65", country: "新加坡" },
    { code: "+86", country: "中國" },
    { code: "+852", country: "香港" },
    { code: "+853", country: "澳門" },
    { code: "+81", country: "日本" },
    { code: "+82", country: "韓國" },
    { code: "+63", country: "菲律賓" },
    { code: "+66", country: "泰國" },
    { code: "+62", country: "印尼" },
    { code: "+84", country: "越南" },
    { code: "+95", country: "緬甸" },
    { code: "+855", country: "柬埔寨" },
    { code: "+856", country: "寮國" },
    { code: "+673", country: "汶萊" },
    { code: "+91", country: "印度" },
    { code: "+880", country: "孟加拉" },
    { code: "+94", country: "斯里蘭卡" },
    { code: "+1", country: "美國/加拿大" },
    { code: "+44", country: "英國" },
    { code: "+33", country: "法國" },
    { code: "+49", country: "德國" },
    { code: "+39", country: "義大利" },
    { code: "+34", country: "西班牙" },
    { code: "+31", country: "荷蘭" },
    { code: "+32", country: "比利時" },
    { code: "+41", country: "瑞士" },
    { code: "+43", country: "奧地利" },
    { code: "+46", country: "瑞典" },
    { code: "+47", country: "挪威" },
    { code: "+45", country: "丹麥" },
    { code: "+358", country: "芬蘭" },
    { code: "+353", country: "愛爾蘭" },
    { code: "+61", country: "澳洲" },
    { code: "+64", country: "紐西蘭" },
    { code: "+27", country: "南非" },
    { code: "+20", country: "埃及" },
    { code: "+971", country: "阿拉伯聯合大公國" },
    { code: "+966", country: "沙烏地阿拉伯" },
    { code: "+974", country: "卡達" },
    { code: "+968", country: "阿曼" },
    { code: "+965", country: "科威特" },
    { code: "+962", country: "約旦" },
    { code: "+972", country: "以色列" },
    { code: "+90", country: "土耳其" },
    { code: "+7", country: "俄羅斯" },
    { code: "+380", country: "烏克蘭" },
    { code: "+48", country: "波蘭" },
    { code: "+420", country: "捷克" },
    { code: "+36", country: "匈牙利" },
    { code: "+40", country: "羅馬尼亞" },
    { code: "+55", country: "巴西" },
    { code: "+52", country: "墨西哥" },
    { code: "+54", country: "阿根廷" },
    { code: "+56", country: "智利" },
    { code: "+51", country: "秘魯" },
    { code: "+57", country: "哥倫比亞" }
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
          helper: data.helper || "",
          secretCodeYear: data.secretCodeYear || "",
          phoneNumber: data.phoneNumber || "",
          countryCode: data.countryCode || "+886"
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
          <label className="block font-medium mb-1">手機號碼</label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-32"
            >
              {countryCodes.map(({ code, country }) => (
                <option key={code} value={code}>
                  {code} {country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
              placeholder="請輸入手機號碼"
              required
            />
          </div>
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
        <div>
          <label className="block font-medium mb-1">请问您是在哪一年开始學習《超级生命密码》？</label>
          <select
            name="secretCodeYear"
            value={formData.secretCodeYear}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">請選擇年份</option>
            {secretCodeYears.map((year) => (
              <option key={year} value={year}>
                {year}
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