import TopicLayout from "./TopicLayout";

export default function Stress() {
  return (
    <TopicLayout
      title="Stress-Related Disorders"
      accent="#f7e7a6"
      intro="Stress-related problems happen when pressure becomes overwhelming and affects your mind and body continuously."
      symptoms={[
        "Burnout, irritation, or feeling numb",
        "Headaches, stomach issues, fatigue",
        "Overthinking and difficulty focusing",
        "Feeling tense or easily triggered",
      ]}
      whyItHappens={[
        "Long-term workload or emotional pressure",
        "Major life changes or responsibilities",
        "Poor sleep and no recovery time",
      ]}
      tips={[
        "Break tasks into 10–20 minute blocks",
        "Take screen breaks + drink water",
        "Make a simple routine (sleep/meals)",
        "Talk to someone you trust",
      ]}
    />
  );
}
