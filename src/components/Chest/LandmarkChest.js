import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import BaseChest from './BaseChest';
import { landmarkChestQuotes } from '../../config/landmarkChestQuotes';

export default function LandmarkChest({ 
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
    setIsVisible(true);
  }, []);

  const iconSize = 80 * scale;
  const iconOffset = iconSize / 2;
  const textOffset = 50 * scale;
  const fontSize = 13 * scale;

  const getState = () => {
    if (id > unlockedIndex) {
      return 'locked';
    } else if (progress?.[id]) {
      return 'completed';
    } else {
      return 'open';
    }
  };

  const handleClick = () => {
    if (progress?.[id]) return;
    onClickMarker(id);
  };

  const getChestIcon = () => {
    switch (getState()) {
      case 'locked':
        return `${process.env.PUBLIC_URL}/icons/lock.svg`;
      case 'open':
        return `${process.env.PUBLIC_URL}/icons/chest-closed.svg`;
      case 'completed':
        return `${process.env.PUBLIC_URL}/icons/chest-open.svg`;
      default:
        return `${process.env.PUBLIC_URL}/icons/chest-closed.svg`;
    }
  };

  const getPosition = () => ({
    left: `${cx - iconOffset}px`,
    top: `${cy - iconOffset}px`
  });

  return (
    <>
      <g key={`group-${id}`} className={isVisible ? "opacity-100" : "opacity-0"}>
        <g transform={`translate(${cx}, ${cy})`}>
          {getState() === 'locked' ? (
            <image
              href={getChestIcon()}
              x={-iconOffset}
              y={-iconOffset}
              width={iconSize}
              height={iconSize}
              className="cursor-not-allowed"
            />
          ) : (
            <foreignObject x={-iconOffset} y={-iconOffset} width={iconSize} height={iconSize}>
              <div className="w-full h-full" onClick={handleClick}>
                <BaseChest
                  id={id}
                  type="landmark"
                  state={getState()}
                  position={{ left: 0, top: 0 }}
                  size={iconSize}
                  onClick={handleClick}
                  quotes={[landmarkChestQuotes.getQuote(id)]}
                />
              </div>
            </foreignObject>
          )}
        </g>
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
          {getState() === 'locked' ? `地標 ${id + 1}（未解鎖）` :
           getState() === 'completed' ? `地標 ${id + 1}（通關成功）` :
           `地標 ${id + 1}（未通關）`}
        </text>
      </g>
    </>
  );
} 