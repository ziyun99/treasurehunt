import hotspots from "../../hotspots.json";

export default function Map({ progress, onClickMarker, getUnlockedIndex }) {
  const unlockedIndex = getUnlockedIndex();

  const getLabelColor = (status) => {
    switch (status) {
      case "done": return "#166534"; // dark green
      case "unlocked": return "#854d0e"; // dark gold
      case "locked": return "#4b5563"; // dark gray
      default: return "#ccc";
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 800 600" className="w-full h-full max-h-screen">
        <defs>
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        <image
          href={`${process.env.PUBLIC_URL}/map.svg`}
          width="800"
          height="600"
          preserveAspectRatio="xMidYMid meet"
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
              <g transform={`translate(${cx}, ${cy})`}>
                <image
                  key={`icon-${id}`}
                  href={`${process.env.PUBLIC_URL}/icons/lock.svg`}
                  x="-35"
                  y="-35"
                  width="70"
                  height="70"
                  className="cursor-not-allowed"
                />
              </g>
            );
            label = `地標 ${id + 1}（未解鎖）`;
            status = "locked";
          } else if (progress[id]) {
            icon = (
              <g 
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onClick={() => onClickMarker(id)}
              >
                <image
                  key={`icon-${id}`}
                  href={`${process.env.PUBLIC_URL}/icons/chest-open.svg`}
                  x="-40"
                  y="-40"
                  width="80"
                  height="80"
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </g>
            );
            label = `地標 ${id + 1}（通關成功）`;
            status = "done";
          } else {
            icon = (
              <g 
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onClick={() => onClickMarker(id)}
              >
                <image
                  key={`icon-${id}`}
                  href={`${process.env.PUBLIC_URL}/icons/chest-closed.svg`}
                  x="-40"
                  y="-40"
                  width="80"
                  height="80"
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </g>
            );
            label = `地標 ${id + 1}（未通關）`;
            status = "unlocked";
          }

          return (
            <g key={`group-${id}`}>
              {icon}
              <text
                x={cx}
                y={cy + 50}
                textAnchor="middle"
                fontSize="13"
                fontWeight="500"
                fontFamily="Segoe UI, sans-serif"
                fill="#fff"
                filter="url(#textShadow)"
                className="transition-opacity duration-300"
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
