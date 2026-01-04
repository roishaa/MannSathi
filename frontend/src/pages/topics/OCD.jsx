import TopicLayout from "./TopicLayout";

export default function OCD() {
  return (
    <TopicLayout
      title="OCD (Obsessive-Compulsive Disorder)"
      accent="#efe6ff"
      intro="OCD involves unwanted thoughts (obsessions) and repetitive behaviors (compulsions) done to reduce anxiety."
      symptoms={[
        "Intrusive thoughts you can’t easily stop",
        "Repeated checking/cleaning/counting",
        "Fear something bad will happen unless you do a ritual",
        "Routines that take a lot of time",
      ]}
      whyItHappens={[
        "Anxiety + habit loop in the brain",
        "Genetics/family history",
        "Stress can trigger/worsen it",
      ]}
      tips={[
        "Delay the compulsion by 1 minute (then 2, 5...)",
        "Label it: 'this is an OCD thought'",
        "Reduce reassurance seeking",
        "Counseling (ERP) is very effective",
      ]}
    />
  );
}
