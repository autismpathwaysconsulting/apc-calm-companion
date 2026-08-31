export const guideOptions = [
  {
    id: "pause",
    number: "01",
    label: "Pause before adding more",
    short: "You have already given several words or instructions.",
    title: "Pause before another instruction",
    steps: [
      "Check for immediate safety, pain, illness or another urgent need.",
      "Stop adding questions or instructions for a moment.",
      "Allow time for a look, movement, gesture, device response or spoken response.",
    ],
    say: "I’ll wait.",
    notice: "Does a little more time make it easier to orient, respond or begin?",
  },
  {
    id: "less-language",
    number: "02",
    label: "Use fewer words",
    short: "You have used a longer message or repeated it several times.",
    title: "Reduce the verbal load",
    steps: [
      "Choose one short phrase.",
      "Pair it with a gesture, object or visual when useful.",
      "Say it once, then pause instead of repeating immediately.",
    ],
    say: "Shoes on.",
    notice: "Is the next action easier to identify when the message is shorter?",
  },
  {
    id: "one-step",
    number: "03",
    label: "Show one next step",
    short: "The next action has not started or needs to be shown more clearly.",
    title: "Make the next step visible",
    steps: [
      "Choose the smallest useful next action.",
      "Show or point to that action.",
      "Wait before introducing the following step.",
    ],
    say: "First, put one book in the bag.",
    notice: "Can the person start when only one concrete step is shown?",
    tool: "first-then",
  },
  {
    id: "first-then",
    number: "04",
    label: "Use first, then",
    short: "The person is asking what happens next or the sequence has changed.",
    title: "Show what happens first and what follows",
    steps: [
      "Choose one accurate first step.",
      "Show what will genuinely happen next.",
      "Keep both parts short and visible.",
    ],
    say: "First toilet, then story.",
    notice: "Does seeing the sequence reduce repeated explanations?",
    tool: "first-then",
  },
  {
    id: "choices",
    number: "05",
    label: "Offer two choices",
    short: "Two genuinely available ways to continue can be shown.",
    title: "Offer two manageable choices",
    steps: [
      "Choose two options that are both possible.",
      "Show the options together without adding more choices.",
      "Accept a point, reach, look, gesture or spoken response.",
    ],
    say: "Blue shirt or green shirt?",
    notice: "Can the person communicate a preference more easily?",
    tool: "choices",
  },
  {
    id: "communication",
    number: "06",
    label: "Make responding easier",
    short: "A spoken response has not come yet.",
    title: "Offer a simple communication response",
    steps: [
      "Show only a few relevant options.",
      "Model the response without demanding repetition.",
      "Accept the person’s usual communication method.",
    ],
    say: "You can show me help, break or all done.",
    notice: "Does an easier response provide useful information about what is needed?",
    tool: "communication",
  },
  {
    id: "environment",
    number: "07",
    label: "Check the situation",
    short: "There is noise, bright light, crowding, discomfort, sudden change or a difficult task.",
    title: "Observe before deciding what the behaviour means",
    steps: [
      "Check for pain, illness, hunger, tiredness or a sudden change.",
      "Notice noise, light, crowding, temperature, clothing and task difficulty.",
      "Change one reasonable factor, then observe again.",
    ],
    say: "Let’s make one part easier.",
    notice: "What became easier, stayed difficult or changed after one adjustment?",
    tool: "observe",
  },
  {
    id: "parent-pause",
    number: "08",
    label: "I need a pause",
    short: "You notice yourself adding words, speaking faster or struggling to choose one next step.",
    title: "Pause before solving",
    steps: [
      "Check that everyone is safe.",
      "Take one ordinary breath and lower your own verbal load.",
      "Choose only one next action from this page.",
    ],
    say: "I can slow this down.",
    notice: "Does choosing one action make the situation easier to approach?",
  },
];

export const communicationOptions = [
  { label: "Help", phrase: "I need help.", icon: "?" },
  { label: "Break", phrase: "I need a break.", icon: "||" },
  { label: "Wait", phrase: "Wait please.", icon: "..." },
  { label: "All done", phrase: "I am all done.", icon: "✓" },
  { label: "Yes", phrase: "Yes.", icon: "Y" },
  { label: "No", phrase: "No.", icon: "N" },
  { label: "Stop", phrase: "Stop please.", icon: "!" },
  { label: "Space", phrase: "I need space.", icon: "↔" },
  { label: "Toilet", phrase: "I need the toilet.", icon: "T" },
  { label: "Pain", phrase: "My body hurts.", icon: "+" },
];

export const evidenceNotes = [
  {
    title: "Visual supports",
    summary: "Visual cues and sequences can support understanding, participation and independence for autistic learners.",
    url: "https://afirm.fpg.unc.edu/resource/visual-supports-brief-packet/",
  },
  {
    title: "Functional communication",
    summary: "Teaching accessible communication responses can help a learner express needs in a clearer way.",
    url: "https://afirm.fpg.unc.edu/resource/functional-communication-training-brief-packet/",
  },
  {
    title: "Antecedent-based supports",
    summary: "Adjusting what happens before a difficult moment can support participation and reduce avoidable barriers.",
    url: "https://afirm.fpg.unc.edu/resource/antecedent-based-interventions-brief-packet/",
  },
];

export function normaliseMinutes(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 1;
  return Math.min(60, Math.max(1, number));
}

export function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number.parseInt(totalSeconds, 10) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
