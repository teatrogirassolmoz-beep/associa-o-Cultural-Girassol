export function StageArtwork({ fiti = false }: { fiti?: boolean }) {
  return (
    <div
      className={`stage-art stage-collage ${fiti ? "stage-art-fiti" : ""}`}
      aria-hidden="true"
    >
      <svg className="collage-sun" viewBox="0 0 400 400">
        <g fill="currentColor">
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse
              key={i}
              cx="200"
              cy="96"
              rx="18"
              ry="72"
              transform={`rotate(${i * 22.5} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="70" />
        </g>
      </svg>
      <svg className="collage-mask collage-mask-coral" viewBox="0 0 220 280">
        <path
          d="M20 22Q110-10 202 28L190 168Q179 234 110 267Q37 231 26 167Z"
          fill="#ff896b"
        />
        <path
          d="M30 38Q112 10 190 41"
          fill="none"
          stroke="#fff2cf"
          strokeWidth="3"
        />
        <path
          d="M48 99Q69 73 91 99M128 99Q150 73 173 99"
          fill="none"
          stroke="#4823a5"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path d="M64 167Q110 218 158 163Q110 189 64 167" fill="#4823a5" />
        <path
          d="m109 98-13 47 22 2"
          fill="none"
          stroke="#d85a55"
          strokeWidth="4"
        />
      </svg>
      <svg className="collage-mask collage-mask-lilac" viewBox="0 0 220 280">
        <path
          d="M20 22Q110-10 202 28L190 168Q179 234 110 267Q37 231 26 167Z"
          fill="#d6b9fb"
        />
        <path
          d="M30 38Q112 10 190 41"
          fill="none"
          stroke="#fff2cf"
          strokeWidth="3"
        />
        <path
          d="M48 95Q69 116 91 95M128 95Q150 116 173 95"
          fill="none"
          stroke="#4823a5"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path d="M66 189Q110 143 157 188Q110 169 66 189" fill="#4823a5" />
        <path
          d="m109 108-13 37 22 2"
          fill="none"
          stroke="#a27cce"
          strokeWidth="4"
        />
      </svg>
      <span className="collage-ink">
        {fiti ? "SEM\nFRONTEIRAS" : "EM\nCENA."}
      </span>
      <span className="stage-art-tag">
        {fiti ? "O mundo encontra-se aqui" : "A cultura move-nos"}
      </span>
      <svg className="collage-scribble" viewBox="0 0 300 110">
        <path
          d="M15 80Q110 2 200 42T270 23M189 10l87 9-31 57"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="stage-art-caption">
        MAPUTO · MOÇAMBIQUE
        <br />
        CORPOS / VOZES / ENCONTROS
      </span>
    </div>
  );
}
