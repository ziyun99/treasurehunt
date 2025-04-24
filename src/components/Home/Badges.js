import { useEffect, useState } from "react";
import badges from "../../data/badges.json";
import AchievementNotification from "./AchievementNotification";

export default function Badges({ progress }) {
  const [earned, setEarned] = useState({});
  const [prevEarned, setPrevEarned] = useState({});

  useEffect(() => {
    const totalCompleted = Object.values(progress || {}).filter(Boolean).length;
    const newEarned = {
      firstStep: progress?.[0],
      halfWay: totalCompleted >= 3,
      completed: totalCompleted === 7
    };
    setPrevEarned(earned);
    setEarned(newEarned);
  }, [progress]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <AchievementNotification earned={earned} prevEarned={prevEarned} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">我的徽章牆</h1>
        <div className="text-right text-lg font-semibold text-indigo-600">
          💎 鑽石得分：<span className="text-2xl">{progress?.diamonds || 0}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {badges.map((b) => (
          <div key={b.id} className="text-center">
            <img
              src={`/icons/${b.icon}`}
              alt={b.label}
              className={`mx-auto w-20 h-20 ${earned[b.id] ? "" : "grayscale opacity-40"}`}
            />
            <p className="mt-2 font-semibold">{b.label}</p>
            <p className="text-sm text-gray-500 mt-1">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
