import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { db } from "./firebase";
import badges from "./badges.json";

export default function Badges() {
  const [progress, setProgress] = useState({});
  const [earned, setEarned] = useState({});
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProgress(data.progress || {});
      }
    };
    fetchProgress();
  }, [user]);

  useEffect(() => {
    const totalCompleted = Object.values(progress).filter(Boolean).length;
    setEarned({
      firstStep: progress[0],
      halfWay: totalCompleted >= 3,
      completed: totalCompleted === 7
    });
  }, [progress]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">我的徽章牆</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {badges.map((b) => (
          <div key={b.id} className="text-center">
            <img
              src={`/icons/${b.icon}`}
              alt={b.label}
              className={`mx-auto w-20 h-20 ${earned[b.id] ? "" : "grayscale opacity-40"}`}
            />
            <p className="mt-2 font-semibold">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
