export default function Map({ progress, onClickMarker, getUnlockedIndex }) {
  const hotspots = [
    { id: 0, cx: 100, cy: 120 },
    { id: 1, cx: 200, cy: 180 },
    { id: 2, cx: 320, cy: 250 },
    { id: 3, cx: 450, cy: 300 },
    { id: 4, cx: 580, cy: 220 },
    { id: 5, cx: 660, cy: 360 },
    { id: 6, cx: 720, cy: 480 },
  ];

  const unlockedIndex = getUnlockedIndex();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg viewBox="0 0 800 600" className="w-full h-auto">
        <image href={`${process.env.PUBLIC_URL}/map-bg.svg`} width="800" height="600" />

        {hotspots.map(({ id, cx, cy }) => (
          id <= unlockedIndex ? (
            <circle
              key={id}
              cx={cx}
              cy={cy}
              r="20"
              fill={progress[id] ? "green" : "gold"}
              stroke="black"
              strokeWidth="2"
              className="cursor-pointer hover:scale-110 transition"
              onClick={() => onClickMarker(id)}
            />
          ) : (
            <circle
              key={id}
              cx={cx}
              cy={cy}
              r="20"
              fill="gray"
              stroke="black"
              strokeWidth="2"
              className="cursor-not-allowed"
            />
          )
        ))}
      </svg>
    </div>
  );
}
