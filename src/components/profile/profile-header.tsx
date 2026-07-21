import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  email: string;
  image?: string | null;
}

export function ProfileHeader({ name, image }: ProfileHeaderProps) {
  return (
    <header
      className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "var(--secondary-container)" }}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: "var(--on-secondary-container)" }}
            >
              person
            </span>
          )}
        </div>
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--primary)" }}
        >
          Loop
        </span>
      </div>
      <button
        className="material-symbols-outlined hover:opacity-70 transition-opacity"
        style={{ color: "var(--on-surface-variant)" }}
      >
        settings
      </button>
    </header>
  );
}