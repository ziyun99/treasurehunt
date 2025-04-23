import hotspots from "./hotspots.json";

export default function Map({ progress, onClickMarker, getUnlockedIndex }) {
  const unlockedIndex = getUnlockedIndex();

  const getLabelColor = (status) => {
    switch (status) {
      case "done": return "#34d399"; // green
      case "unlocked": return "#facc15"; // gold
      case "locked": return "#9ca3af"; // gray
      default: return "#ccc";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <svg viewBox="0 0 800 600" className="w-full h-auto">
        <defs>
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        <image
          href={`${process.env.PUBLIC_URL}/map-bg.svg`}
          width="800"
          height="600"
        />

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

        {hotspots.map(({ id, cx, cy }) => {
          let icon, label, status;
          if (id > unlockedIndex) {
            icon = (
              <image
                key={`icon-${id}`}
                href={`${process.env.PUBLIC_URL}/icons/lock.svg`}
                x={cx - 16}
                y={cy - 16}
                width="70"
                height="70"
                className="cursor-not-allowed"
              />
            );
            label = `地標 ${id + 1}（未解鎖）`;
            status = "locked";
          } else if (progress[id]) {
            icon = (
              <image
                key={`icon-${id}`}
                href={`${process.env.PUBLIC_URL}/icons/chest-open.svg`}
                x={cx - 20}
                y={cy - 20}
                width="80"
                height="80"
                className="cursor-pointer hover:scale-125 transition-transform animate-float"
                onClick={() => onClickMarker(id)}
              />
            );
            label = `地標 ${id + 1}（通關成功）`;
            status = "done";
          } else {
            icon = (
              <image
                key={`icon-${id}`}
                href={`${process.env.PUBLIC_URL}/icons/chest-closed.svg`}
                x={cx - 20}
                y={cy - 20}
                width="80"
                height="80"
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onClickMarker(id)}
              />
            );
            label = `地標 ${id + 1}（未通關）`;
            status = "unlocked";
          }

          return (
            <g key={`group-${id}`}>
              {icon}
              <text
                x={cx}
                y={cy + 65}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Segoe UI, sans-serif"
                fill="#fff"
                filter="url(#textShadow)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
