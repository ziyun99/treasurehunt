import { useEffect, useState } from "react";
import badges from "../../data/badges.json";
import DiamondLogsModal from '../modals/DiamondLogsModal';

export default function Badges({ progress, user, diamondPoints }) {
  const [earned, setEarned] = useState({});
  const [showDiamondLogs, setShowDiamondLogs] = useState(false);

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
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2 -mx-1">
        <div className="flex gap-2 sm:gap-3 min-w-max px-2">
          {badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center min-w-[70px] sm:min-w-[80px]">
              <div className="relative">
                <img
                  src={`/icons/${b.icon}`}
                  alt={b.label}
                  className={`w-9 h-9 sm:w-10 sm:h-10 ${earned[b.id] ? "" : "grayscale opacity-40"}`}
                />
                {earned[b.id] && (
                  <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-medium mt-0.5 text-center">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      <DiamondLogsModal 
        isOpen={showDiamondLogs}
        onClose={() => setShowDiamondLogs(false)}
        user={user}
      />
    </div>
  );
}
