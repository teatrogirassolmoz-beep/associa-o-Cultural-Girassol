export function StageArtwork({ fiti = false }: { fiti?: boolean }) {
  return (
    <div
      className={`stage-art ${fiti ? "stage-art-fiti" : ""}`}
      aria-hidden="true"
    >
      <div className="stage-art-orbit" />
      <svg className="stage-flower" viewBox="0 0 400 400" fill="none">
        <g fill="currentColor">
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx="200"
              cy="95"
              rx="34"
              ry="83"
              transform={`rotate(${i * 30} 200 200)`}
            />
          ))}
        </g>
        <circle cx="200" cy="200" r="82" fill="#4823a5" />
        <path
          d="M150 190Q169 167 187 190M214 190Q233 167 251 190"
          stroke="#ffdc55"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M163 220Q200 264 239 220"
          stroke="#ffdc55"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      <span className="stage-art-tag">
        {fiti ? "O mundo em palco" : "A cultura move-nos"}
      </span>
      <span className="stage-art-star">✳</span>
      <span className="stage-art-caption">
        MAPUTO · MOÇAMBIQUE
        <br />
        CRIAÇÃO / ENCONTRO / MOVIMENTO
      </span>
    </div>
  );
}
