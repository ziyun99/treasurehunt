import { useEffect, useState } from "react";
import LandmarkChest from "../Chest/LandmarkChest";
import DiamondChest from "../Chest/DiamondChest";
import DailyChest from "../Chest/DailyChest";
import { diamondChestConfig } from "../../config/diamondChestConfig";

export default function ChestOverlay({ 
  progress, 
  unlockedIndex, 
  onClickMarker,
  diamondPoints,
  setDiamondPoints,
  setShowDiamondBonus,
  setDiamondBonusType,
  user
}) {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });
      setIsPortrait(height > width);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate landmark positions
  const calculateLandmarks = () => {
    const { width, height } = viewportSize;
    const numLandmarks = 7;
    const landmarks = [];

    if (isPortrait) {
      // Portrait layout - fixed random zigzag pattern
      const horizontalMargin = width * 0.15;
      const verticalMargin = height * 0.2;
      const verticalSpacing = (height - 2 * verticalMargin) / (numLandmarks - 1);
      const centerX = width / 2;
      const baseAmplitude = (width - 2 * horizontalMargin) / 3;
      
      // Predefined variations for consistent pattern
      const variations = [
        { amplitude: 1.1, phase: 0.1 },
        { amplitude: 0.9, phase: -0.15 },
        { amplitude: 1.2, phase: 0.12 },
        { amplitude: 1.0, phase: -0.1 },
        { amplitude: 1.1, phase: 0.1 },
        { amplitude: 0.95, phase: -0.2 },
        { amplitude: 1.05, phase: 0.05 }
      ];

      for (let i = 0; i < numLandmarks; i++) {
        const y = verticalMargin + (verticalSpacing * i);
        const amplitude = baseAmplitude * variations[i].amplitude;
        const phase = variations[i].phase;
        const x = centerX + amplitude * Math.sin(i * Math.PI / 2 + phase);
        landmarks.push({ id: i, cx: x, cy: y });
      }
    } else {
      // Landscape layout - fixed random wave pattern
      const verticalMargin = height * 0.15;
      const horizontalSpacing = width / (numLandmarks + 1);
      const centerY = height / 2;
      const baseAmplitude = (height - 2 * verticalMargin) / 3;
      
      // Predefined variations for consistent pattern
      const variations = [
        { amplitude: 1.1, phase: 0.1, offset: 15 },
        { amplitude: 0.9, phase: -0.15, offset: -10 },
        { amplitude: 1.2, phase: 0.1, offset: 20 },
        { amplitude: 0.8, phase: -0.1, offset: -15 },
        { amplitude: 1.15, phase: 0.15, offset: 10 },
        { amplitude: 0.9, phase: -0.1, offset: -10 },
        { amplitude: 1.05, phase: 0.05, offset: 5 }
      ];

      for (let i = 0; i < numLandmarks; i++) {
        const x = horizontalSpacing * (i + 1);
        const amplitude = baseAmplitude * variations[i].amplitude;
        const phase = variations[i].phase;
        const verticalOffset = variations[i].offset;
        const y = centerY + amplitude * Math.sin((i / (numLandmarks - 1)) * Math.PI * 2 + phase) + verticalOffset;
        landmarks.push({ id: i, cx: x, cy: y });
      }
    }

    return landmarks;
  };

  // Calculate diamond chest positions with offset from regular chests
  const calculateDiamondChests = () => {
    const { width, height } = viewportSize;
    const chests = [];
    const firstLandmark = landmarks[0];
    if (!firstLandmark) return chests;

    const offsets = isPortrait ? diamondChestConfig.positions.portrait : diamondChestConfig.positions.landscape;

    for (let i = 0; i < 3; i++) {
      chests.push({
        id: i,
        cx: firstLandmark.cx + (width * offsets[i].x),
        cy: firstLandmark.cy + (height * offsets[i].y)
      });
    }

    return chests;
  };

  const landmarks = calculateLandmarks();
  const diamondChests = calculateDiamondChests();

  // Calculate scale factor based on viewport size
  const baseViewportSize = 800; // Base viewport width for scaling
  const scale = Math.min(
    Math.max(viewportSize.width / baseViewportSize, 1), // Minimum scale of 1
    1.5 // Maximum scale of 1.5
  );

  const getDiamondChestState = (id) => {
    if (id > unlockedIndex) {
      return 'locked';
    } else if (progress[`diamond_${id}`]) {
      return 'completed';
    } else {
      return 'open';
    }
  };

  const handleDiamondComplete = async (id) => {
    progress[`diamond_${id}`] = true;
  };

  return (
    <svg 
      viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
      className="absolute inset-0 z-10 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Daily Chest */}
      <g transform={`translate(${
        isPortrait 
          ? landmarks[0]?.cx - (viewportSize.width/4)
          : landmarks[0]?.cx - 0
      }, ${
        isPortrait
          ? landmarks[0]?.cy - 0
          : landmarks[0]?.cy - (viewportSize.height/5)
      })`}>
        <foreignObject 
          x={-40 * scale} 
          y={-40 * scale} 
          width={80 * scale} 
          height={80 * scale}
          overflow="visible"
        >
          <div className="w-full h-full overflow-visible">
            <DailyChest 
              user={user}
              diamondPoints={diamondPoints}
              setDiamondPoints={setDiamondPoints}
              setShowDiamondBonus={setShowDiamondBonus}
              setDiamondBonusType={setDiamondBonusType}
            />
          </div>
        </foreignObject>
        <text
          x={0}
          y={50 * scale}
          textAnchor="middle"
          fontSize={13 * scale}
          fontWeight="500"
          fontFamily="Segoe UI, sans-serif"
          fill="#fff"
          filter="url(#textShadow)"
          className="transition-opacity duration-300"
        >
          每日簽到
        </text>
      </g>

      {/* Draw curved lines connecting all checkpoints */}
      {landmarks.map((point, idx) => {
        if (idx === 0) return null;
        const prev = landmarks[idx - 1];
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
            strokeWidth={4 * scale}
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

      {/* Render all landmarks */}
      {landmarks.map(({ id, cx, cy }) => (
        <LandmarkChest
          key={id}
          id={id}
          cx={cx}
          cy={cy}
          scale={scale}
          progress={progress}
          unlockedIndex={unlockedIndex}
          onClickMarker={onClickMarker}
        />
      ))}

      {/* Render all diamond chests */}
      {diamondChests.map(({ id, cx, cy }) => {
        const state = getDiamondChestState(id);
        const iconSize = diamondChestConfig.size.icon * scale;
        const iconOffset = iconSize / 2;
        const textOffset = 50 * scale;
        const fontSize = diamondChestConfig.size.text * scale;

        return (
          <g key={id} transform={`translate(${cx}, ${cy})`}>
            {state === 'locked' ? (
              <image
                href={diamondChestConfig.getImage(id, 'locked')}
                x={-iconOffset}
                y={-iconOffset}
                width={iconSize}
                height={iconSize}
                className="cursor-not-allowed"
              />
            ) : state === 'completed' ? (
              <image
                href={diamondChestConfig.getImage(id, 'completed')}
                x={-iconOffset}
                y={-iconOffset}
                width={iconSize}
                height={iconSize}
              />
            ) : (
              <foreignObject x={-iconOffset} y={-iconOffset} width={iconSize} height={iconSize} overflow="visible">
                <div className="w-full h-full">
                  <DiamondChest
                    id={id}
                    position={{ left: 0, top: 0 }}
                    state={state}
                    onComplete={() => handleDiamondComplete(id)}
                    user={user}
                    diamondPoints={diamondPoints}
                    setDiamondPoints={setDiamondPoints}
                    setShowDiamondBonus={setShowDiamondBonus}
                    setDiamondBonusType={setDiamondBonusType}
                    image={diamondChestConfig.getImage(id, 'open')}
                  />
                </div>
              </foreignObject>
            )}
            <text
              x={0}
              y={textOffset}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="500"
              fontFamily="Segoe UI, sans-serif"
              fill="#fff"
              filter="url(#textShadow)"
              className="transition-opacity duration-300"
            >
              {diamondChestConfig.text[state](id)}
            </text>
          </g>
        );
      })}
    </svg>
  );
} 