import { useEffect, useState } from "react";
import Hotspot from "./Hotspot";
import hotspots from "../../data/hotspots.json";

export default function HotspotsOverlay({ progress, unlockedIndex, onClickMarker }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Draw curved lines connecting all checkpoints */}
        {hotspots.map((point, idx) => {
          if (idx === 0) return null;
          const prev = hotspots[idx - 1];
          const cx1 = prev.cx;
          const cy1 = prev.cy;
          const cx2 = point.cx;
          const cy2 = point.cy;
          const dx = Math.abs(cx2 - cx1) / 2;
          const curve = `M ${cx1},${cy1} C ${cx1 + dx},${cy1} ${cx2 - dx},${cy2} ${cx2},${cy2}`;
          return (
            <path
              key={`line-${idx}`}
              d={curve}
              stroke="#fbbf24"
              strokeWidth="4"
              strokeDasharray="6,4"
              fill="none"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </path>
          );
        })}

        {/* Render all hotspots */}
        {hotspots.map(({ id, cx, cy }) => (
          <Hotspot
            key={id}
            id={id}
            cx={cx}
            cy={cy}
            progress={progress}
            unlockedIndex={unlockedIndex}
            onClickMarker={onClickMarker}
          />
        ))}
      </svg>
    </div>
  );
} 