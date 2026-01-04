import TopicLayout from "./TopicLayout";

export default function Relationships() {
  return (
    <TopicLayout
      title="Relationships"
      accent="#e3f3e6"
      intro="Relationship struggles can affect mental health. Communication, trust, and boundaries matter a lot."
      symptoms={[
        "Frequent arguments or misunderstandings",
        "Overthinking texts/actions",
        "Trust issues or fear of abandonment",
        "Feeling emotionally drained",
      ]}
      whyItHappens={[
        "Different communication styles",
        "Past emotional wounds",
        "Unclear boundaries or unmet needs",
      ]}
      tips={[
        "Use 'I feel...' instead of blaming",
        "Set boundaries clearly",
        "Take breaks during heated conflict",
        "Reflect on what you need",
      ]}
    />
  );
}
