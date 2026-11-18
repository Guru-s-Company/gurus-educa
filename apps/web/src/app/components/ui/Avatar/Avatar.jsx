import "./Avatar.css";

export default function Avatar({ name = "Estudante", imageUrl = null, tone = "purple", size = "md" }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className={`avatar avatar--${tone} avatar--${size}`} aria-label={name}>
      {imageUrl ? <img src={imageUrl} alt="" /> : <span aria-hidden="true">{initials || "E"}</span>}
    </span>
  );
}
