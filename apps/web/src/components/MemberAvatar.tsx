
type MemberAvatarProps = {
  name: string;
  size?: number;
};

const avatarColors = [
  { background: "#DBEAFE", foreground: "#1D4ED8" },
  { background: "#FCE7F3", foreground: "#9D174D" },
  { background: "#D1FAE5", foreground: "#047857" },
  { background: "#FEF3C7", foreground: "#92400E" },
  { background: "#EDE9FE", foreground: "#6D28D9" },
  { background: "#CFFAFE", foreground: "#155E75" },
];

export default function MemberAvatar({
  name,
  size = 52,
}: MemberAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

  const colorIndex = Array.from(name).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  ) % avatarColors.length;

  const colors = avatarColors[colorIndex];

  return (
    <span
      role="img"
      aria-label={`${name || "Member"} avatar`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors.background,
        color: colors.foreground,
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}
