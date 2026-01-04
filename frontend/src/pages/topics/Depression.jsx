import TopicLayout from "./TopicLayout";

export default function Depression() {
  return (
    <TopicLayout
      title="Depression"
      accent="#ffe1d6"
      intro="Depression is more than sadness—it can affect energy, sleep, appetite, motivation, and self-worth."
      symptoms={[
        "Low mood most days",
        "Loss of interest in hobbies",
        "Low energy and hopelessness",
        "Sleep/appetite changes",
      ]}
      whyItHappens={[
        "Long-term stress or trauma",
        "Loneliness and lack of support",
        "Biological factors/hormones",
        "Grief or life setbacks",
      ]}
      tips={[
        "Start very small (one task at a time)",
        "Don’t isolate—talk to someone",
        "Keep a basic routine (sleep, meals)",
        "Do one enjoyable thing daily",
      ]}
    />
  );
}
