import Image from "next/image";

interface ProfileAvatarProps {
  name: string;
  email: string;
  image?: string | null;
}

export function ProfileAvatar({ name, email, image }: ProfileAvatarProps) {
  return (
    <section className="flex flex-col items-center text-center gap-4">
      <div className="relative">
        {/* Gradient ring */}
        <div
          className="w-32 h-32 rounded-full p-1"
          style={{
            background:
              "linear-gradient(to top right, var(--secondary), var(--secondary-container))",
          }}
        >
          {/* Inner white border + image */}
          <div
            className="w-full h-full rounded-full border-4 overflow-hidden flex items-center justify-center"
            style={{
              borderColor: "var(--surface)",
              backgroundColor: "var(--secondary-container)",
            }}
          >
            {image ? (
              <Image
                src={image}
                alt={name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 48,
                  color: "var(--on-secondary-container)",
                }}
              >
                person
              </span>
            )}
          </div>
        </div>

        {/* PRO badge */}
        <div
          className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5"
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{
              fontSize: 14,
              fontVariationSettings: "'FILL' 1",
            }}
          >
            workspace_premium
          </span>
          <span className="text-white text-[11px] font-bold tracking-widest uppercase">
            PRO
          </span>
        </div>
      </div>

      <div>
        <h1
          className="text-[28px] font-bold leading-tight"
          style={{ color: "var(--on-surface)" }}
        >
          {name || "Your Name"}
        </h1>
        <p
          className="text-sm mt-0.5 opacity-70"
          style={{ color: "var(--on-surface-variant)" }}
        >
          {email}
        </p>
      </div>
    </section>
  );
}