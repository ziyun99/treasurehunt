import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import UserProfileForm from "./UserProfileForm";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfileUpdate = async (updatedData) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { ...updatedData, profileCompleted: true }, { merge: true });
    setUserData(updatedData);
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6 flex items-center justify-center">
        <p className="text-xl">請先登入</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">個人資料</h1>
          {userData?.profileCompleted && (
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800"
            >
              返回首頁
            </button>
          )}
        </div>
        <UserProfileForm
          initialData={userData}
          onClose={handleProfileUpdate}
        />
      </div>
    </div>
  );
} 