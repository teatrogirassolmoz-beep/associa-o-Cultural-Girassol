"use client";
import { useId } from "react";

type Props = { variant?: number; title?: string; className?: string };
const palettes = [
  { paper: "#ff7751", ink: "#49237b", light: "#ffe582", accent: "#a8eadb" },
  { paper: "#ffd85b", ink: "#5836aa", light: "#fff0cc", accent: "#f07872" },
  { paper: "#a6d9d4", ink: "#573381", light: "#f9e3bc", accent: "#fd8663" },
  { paper: "#6747ba", ink: "#ffe28a", light: "#c8b7f1", accent: "#fc8967" },
];

/** Original illustrations of expression and encounter, never presented as event photographs. */
export function ArtPoster({
  variant = 0,
  title = "Teatro e encontro",
  className = "",
}: Props) {
  const id = useId().replace(/:/g, "");
  const palette =
    palettes[((variant % palettes.length) + palettes.length) % palettes.length];
  const type = ((variant % 4) + 4) % 4;
  return (
    <svg
      viewBox="0 0 600 720"
      role="img"
      aria-label={`Ilustração original — ${title}`}
      className={`art-poster ${className}`}
    >
      <defs>
        <pattern
          id={`${id}-grain`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r=".7" fill={palette.ink} opacity=".17" />
        </pattern>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={palette.light} />
          <stop offset="1" stopColor={palette.accent} />
        </linearGradient>
      </defs>
      <path fill={palette.paper} d="M0 0h600v720H0z" />
      <circle cx="450" cy="170" r="230" fill={palette.light} opacity=".32" />
      <path
        d="M-90 650Q250 110 700 230L700 720H-90Z"
        fill={palette.accent}
        opacity=".4"
      />
      <g
        transform={type === 1 ? "translate(300 305)" : "translate(380 270)"}
        fill={palette.light}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-105"
            rx="19"
            ry="75"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
        <circle r="66" fill={palette.paper} />
      </g>
      {type === 0 || type === 3 ? (
        <g fill={palette.ink}>
          <path d="M245 287Q203 306 186 366L126 434 40 401 26 428 136 487Q157 492 178 473L226 426 229 503 178 640 211 650 287 534 330 662 366 650 319 488 343 391 405 437Q425 448 443 432L553 334 531 309 429 383 367 302Q343 281 312 278Z" />
          <path d="M257 250Q220 222 242 174Q264 130 307 151Q344 170 327 215Q313 250 283 256Z" />
          <path
            d="M243 166Q253 116 304 133Q345 148 337 184Q312 158 287 169Q264 178 243 166Z"
            fill={palette.accent}
          />
          <path
            d="M250 295Q275 326 321 302M235 413l76 7M260 354l48 12"
            fill="none"
            stroke={palette.paper}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="m42 395-25-28m15 39-26-7m533-91 26-30m-18 40 27-10"
            fill="none"
            stroke={palette.ink}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
      ) : type === 1 ? (
        <g fill={palette.ink}>
          <path d="M65 720V323Q125 268 183 319L236 389 214 410 162 364 185 514 153 720Z" />
          <circle cx="128" cy="253" r="43" />
          <path d="M535 720V323Q475 268 417 319L364 389 386 410 438 364 415 514 447 720Z" />
          <circle cx="472" cy="253" r="43" />
          <path d="m171 325 121 114 113-116 18 26-118 132q-16 15-32-1L153 349Z" />
          <path d="M261 491h78l29 229H231Z" fill={palette.light} />
          <circle cx="301" cy="422" r="38" fill={palette.light} />
          <path
            d="M97 381l35 19m332 0 35-19"
            fill="none"
            stroke={palette.paper}
            strokeWidth="5"
          />
        </g>
      ) : (
        <g fill={palette.ink}>
          <path d="M18 720V408Q77 340 144 402L186 492 158 507 121 454 139 720Z" />
          <circle cx="83" cy="335" r="40" />
          <path d="M455 720l9-266-40 53-29-15 47-90q69-64 140 6v312Z" />
          <circle cx="519" cy="335" r="40" />
          <path d="m230 720 10-305-44-66-43-68 24-21 61 65 62 33 62-33 61-65 24 21-43 68-44 66 10 305Z" />
          <circle cx="300" cy="288" r="48" />
          <path
            d="M271 358q29 30 58 0m-70 115h81"
            fill="none"
            stroke={palette.paper}
            strokeWidth="6"
          />
          <path
            d="m155 257-17-35m301 35 17-35"
            fill="none"
            stroke={palette.ink}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      )}
      <path fill={`url(#${id}-grain)`} d="M0 0h600v720H0z" />
      <g stroke={palette.ink} fill="none" strokeWidth="3" opacity=".6">
        <path d="M28 28h50M28 28v50m494-50h50v50M28 642v50h50m444 0h50v-50" />
        <path d="M50 105q180-75 365-40M55 122q180-75 365-40" />
      </g>
    </svg>
  );
}
