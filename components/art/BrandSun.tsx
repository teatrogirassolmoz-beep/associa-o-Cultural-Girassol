export function BrandSun() {
  return (
    <svg viewBox="0 0 180 180" className="brand-sun" aria-hidden="true">
      <g transform="translate(90 90)">
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-57"
            rx="9"
            ry="24"
            transform={`rotate(${i * 22.5})`}
            fill={i % 2 ? "#f6b94b" : "#ed8252"}
            fillOpacity=".85"
          />
        ))}
        <circle
          r="37"
          fill="#fff3d9"
          fillOpacity=".9"
          stroke="#7540b6"
          strokeWidth="1.5"
        />
        <path
          d="M-25-5Q-14-19-4-5M5-5Q16-19 26-5M-19 12Q0 37 20 12M-1-6-6 7 3 8"
          fill="none"
          stroke="#7540b6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
