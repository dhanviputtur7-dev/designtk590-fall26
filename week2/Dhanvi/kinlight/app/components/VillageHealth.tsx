type Props = {
  health: number; // 0 to 1
  checkInsThisWeek: number;
};

function healthMessage(health: number) {
  if (health > 0.75) return "✨ Your village is glowing";
  if (health > 0.5) return "🌤️ Your village is warm";
  if (health > 0.25) return "🌙 It's getting quiet in the village";
  return "🌑 The lights are going out. Someone is waiting to hear from you.";
}

export default function VillageHealth({ health, checkInsThisWeek }: Props) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ marginBottom: "0.5rem" }}>{healthMessage(health)}</p>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.round(health * 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #b8741a, #ffc45c)",
            transition: "width 0.8s",
          }}
        />
      </div>

      <p style={{ opacity: 0.6, fontSize: "0.85rem", marginTop: "0.5rem" }}>
        You've checked in with {checkInsThisWeek}{" "}
        {checkInsThisWeek === 1 ? "person" : "people"} this week
      </p>
    </div>
  );
}