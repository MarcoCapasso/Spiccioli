//Le illustrazioni degli stati vuoti
const ILLUSTRATIONS = {
  transactions: (
    <>
      <ellipse cx="80" cy="108" rx="54" ry="7" fill="var(--surface-sunk)" />
      <path
        d="M46 16h58a6 6 0 0 1 6 6v78l-9-6-9 6-9-6-9 6-9-6-9 6-9-6V22a6 6 0 0 1 6-6Z"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      <rect
        x="54"
        y="32"
        width="34"
        height="6"
        rx="3"
        fill="var(--surface-sunk)"
      />
      <rect
        x="54"
        y="46"
        width="44"
        height="6"
        rx="3"
        fill="var(--surface-sunk)"
      />
      <rect
        x="54"
        y="60"
        width="26"
        height="6"
        rx="3"
        fill="var(--surface-sunk)"
      />
      <circle cx="112" cy="76" r="20" fill="var(--primary)" />
      <circle
        cx="112"
        cy="76"
        r="13"
        stroke="#fff"
        strokeOpacity=".55"
        strokeWidth="2.5"
      />
      <path
        d="M112 70v12M106 76h12"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  categories: (
    <>
      <ellipse cx="80" cy="108" rx="54" ry="7" fill="var(--surface-sunk)" />
      <rect
        x="34"
        y="40"
        width="56"
        height="40"
        rx="12"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2"
        transform="rotate(-8 62 60)"
      />
      <rect
        x="62"
        y="34"
        width="62"
        height="44"
        rx="12"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      <circle cx="80" cy="56" r="8" fill="var(--primary)" />
      <rect
        x="94"
        y="50"
        width="22"
        height="5"
        rx="2.5"
        fill="var(--surface-sunk)"
      />
      <rect
        x="94"
        y="59"
        width="14"
        height="5"
        rx="2.5"
        fill="var(--surface-sunk)"
      />
      <circle cx="118" cy="86" r="13" fill="var(--secondary)" />
      <path
        d="M118 81v10M113 86h10"
        stroke="var(--surface)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </>
  ),
  search: (
    <>
      <ellipse cx="80" cy="108" rx="54" ry="7" fill="var(--surface-sunk)" />
      <circle
        cx="72"
        cy="56"
        r="28"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      <path
        d="m92 76 20 20"
        stroke="var(--secondary)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M62 56h20"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  ),
};

export type IllustrationName = keyof typeof ILLUSTRATIONS;

//Un'illustrazione decorativa
export function Illustration({ name }: { name: IllustrationName }) {
  return (
    <svg className="illu" viewBox="0 0 160 120" fill="none" aria-hidden="true">
      {ILLUSTRATIONS[name]}
    </svg>
  );
}
