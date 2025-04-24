import { useState, useEffect } from "react";
import Map from "../../Map";
import Badges from "../../Badges";

const START_DATE = new Date("2025-04-23T00:00:00");

export default function MainContent({ user, userData, progress, onLandmarkClick }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextUnlock = new Date(START_DATE);
      nextUnlock.setDate(START_DATE.getDate() + getUnlockedIndex() + 1);
      const diff = nextUnlock - now;
      if (diff <= 0) {
        setCountdown("已解鎖下一地標！");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`距離下一地標解鎖：${hours}時 ${minutes}分 ${seconds}秒`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getUnlockedIndex = () => {
    const today = new Date();
    const diff = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!user || !userData?.profileCompleted) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">我的尋寶圖</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">{countdown}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Map progress={progress} onClickMarker={onLandmarkClick} getUnlockedIndex={getUnlockedIndex} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">我的成就</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Badges />
        </div>
      </div>
    </div>
  );
} 