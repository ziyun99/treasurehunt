import { useEffect, useState } from "react";
import badges from "../../data/badges.json";

export default function Badges({ progress }) {
  const [earned, setEarned] = useState({});

  useEffect(() => {
    const totalCompleted = Object.values(progress || {}).filter(Boolean).length;
    const newEarned = {
      firstStep: progress?.[0],
      halfWay: totalCompleted >= 3,
      completed: totalCompleted === 7
    };
    setEarned(newEarned);
  }, [progress]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {badges.map((b) => (
        <div key={b.id} className="text-center">
          <img
            src={`/icons/${b.icon}`}
            alt={b.label}
            className={`mx-auto w-10 h-10 ${earned[b.id] ? "" : "grayscale opacity-40"}`}
          />
          <p className="text-xs font-medium mt-1">{b.label}</p>
          <div className="text-right text-xs text-indigo-600">
            {earned[b.id] ? "✓" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
