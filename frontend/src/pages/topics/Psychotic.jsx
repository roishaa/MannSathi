import TopicLayout from "./TopicLayout";

export default function Psychotic() {
  return (
    <TopicLayout
      title="Psychotic Disorders"
      accent="#d7ecff"
      intro="Psychotic disorders affect how someone understands reality. It can include hallucinations or unusual beliefs."
      symptoms={[
        "Hearing/seeing things others don’t",
        "Strong unusual beliefs (delusions)",
        "Confused thinking or speech",
        "Withdrawing from people",
      ]}
      whyItHappens={[
        "Brain chemistry changes",
        "Genetics/family history",
        "Severe stress or substance use",
      ]}
      tips={[
        "Seek professional support early (important)",
        "Avoid alcohol/drugs",
        "Keep a calm daily routine",
        "Stay connected with trusted people",
      ]}
    />
  );
}
