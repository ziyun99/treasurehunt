import { useEffect, useState } from "react";

export default function Hotspot({ 
  id, 
  cx, 
  cy, 
  progress, 
  unlockedIndex, 
  onClickMarker 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts
    setIsVisible(true);
  }, []);

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
    <g key={`group-${id}`} className={isVisible ? "opacity-100" : "opacity-0"}>
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
} 