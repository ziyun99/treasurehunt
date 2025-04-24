import { useEffect, useState } from "react";

export default function Hotspot({ 
  id, 
  cx, 
  cy, 
  scale = 1,
  progress, 
  unlockedIndex, 
  onClickMarker 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts
    setIsVisible(true);
  }, []);

  // Calculate scaled dimensions
  const iconSize = 80 * scale;
  const iconOffset = iconSize / 2;
  const textOffset = 50 * scale;
  const fontSize = 13 * scale;

  let icon, label, status;
  if (id > unlockedIndex) {
    icon = (
      <g transform={`translate(${cx}, ${cy})`}>
        <image
          key={`icon-${id}`}
          href={`${process.env.PUBLIC_URL}/icons/lock.svg`}
          x={-iconOffset}
          y={-iconOffset}
          width={iconSize}
          height={iconSize}
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
          x={-iconOffset}
          y={-iconOffset}
          width={iconSize}
          height={iconSize}
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
          x={-iconOffset}
          y={-iconOffset}
          width={iconSize}
          height={iconSize}
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
        y={cy + textOffset}
        textAnchor="middle"
        fontSize={fontSize}
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