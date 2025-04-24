import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

export default function UserProfileForm({ onClose }) {
  const user = getAuth().currentUser;
  const [formData, setFormData] = useState({ name: "", location: "", helper: "" });
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>載入中...</p>;

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">請填寫個人資料</h2>
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
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
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