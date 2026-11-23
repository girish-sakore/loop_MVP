import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBookAtlas,
  faBookBible,
  faBookMedical,
  faBookOpen,
  faBookSkull,
  faSeedling,
  faFlask,
  faDroplet,   // replaces faShell
  faVolcano,
  faLeaf,
  faAnkh,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

const ICONS: Record<string, IconDefinition> = {
  book: faBook,
  "book-atlas": faBookAtlas,
  "book-bible": faBookBible,
  "book-medical": faBookMedical,
  "book-open": faBookOpen,
  "book-skull": faBookSkull,
  seedling: faSeedling,
  flask: faFlask,
  droplet: faDroplet,   // replaces shell: faShell
  volcano: faVolcano,
  leaf: faLeaf,
  ankh: faAnkh,
};

// "fa-solid fa-book-atlas" -> "book-atlas"
function iconKey(value: string) {
  const token = value
    .trim()
    .split(/\s+/)
    .find((t) => t.startsWith("fa-") && !["fa-solid", "fa-regular", "fa-brands"].includes(t));
  return (token ?? value.trim()).replace(/^fa-/, "");
}

function contrastColor(hex?: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 160 ? "#0b0b0f" : "#fff";
}

type ColorIconProps = {
  icon?: string;
  iconColor?: string;
  /** Background the icon sits on, used to pick a readable color. */
  onHex?: string;
  className?: string;
};

export function ColorIcon({ icon, iconColor, onHex, className }: ColorIconProps) {
  const def = icon ? ICONS[iconKey(icon)] : undefined;
  if (!def) return null;
  return (
    <FontAwesomeIcon
      icon={def}
      aria-hidden="true"
      className={["pointer-events-none", className].filter(Boolean).join(" ")}
      style={{ color: iconColor ?? contrastColor(onHex) }}
    />
  );
}