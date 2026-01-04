import TopicLayout from "./TopicLayout";

export default function Anxiety() {
  return (
    <TopicLayout
      title="Anxiety Disorders"
      accent="#f7d8dd"
      intro="Anxiety disorders involve intense worry or fear that feels difficult to control and can affect daily life."
      symptoms={[
        "Constant worrying or feeling on edge",
        "Fast heartbeat, sweating, trembling",
        "Restlessness and trouble sleeping",
        "Avoiding situations because of fear",
      ]}
      whyItHappens={[
        "Stressful events or past trauma",
        "Genetics/family history",
        "Overactive stress response",
        "Long-term pressure (study/work)",
      ]}
      tips={[
        "Try 4-7-8 breathing for 2 minutes",
        "Reduce caffeine and improve sleep routine",
        "Write down worries + what you can control",
        "Go for short daily walks",
      ]}
    />
  );
}
