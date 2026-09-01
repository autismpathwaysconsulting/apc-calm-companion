export const guideOptions = [
  {
    id: "pause",
    number: "01",
    prompt: "I’ve already said a lot",
    label: "Pause before adding more",
    short: "Several words or instructions have already been given.",
    title: "Pause before another instruction",
    now: "Stop adding questions or instructions and allow a moment for a response.",
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
    prompt: "The instruction is too long",
    label: "Use fewer words",
    short: "The message has become long or has been repeated several times.",
    title: "Reduce the verbal load",
    now: "Use one short phrase once, then pause.",
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
    prompt: "They need one clear next step",
    label: "Show one next step",
    short: "The next action has not started or is not yet clear.",
    title: "Make the next step visible",
    now: "Show the smallest useful next action.",
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
    prompt: "They need to know what comes next",
    label: "Use first, then",
    short: "The sequence is unclear, has changed or needs to be shown.",
    title: "Show what happens first and what follows",
    now: "Show one accurate first step and what genuinely happens next.",
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
    prompt: "A choice might help",
    label: "Offer two choices",
    short: "Two genuinely available ways to continue can be offered.",
    title: "Offer two manageable choices",
    now: "Show two choices that are both genuinely available.",
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
    prompt: "No spoken response yet",
    label: "Make responding easier",
    short: "A spoken response has not come yet.",
    title: "Offer a simple communication response",
    now: "Show a few relevant communication options without requiring speech.",
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
    prompt: "Something here may be difficult",
    label: "Check the situation",
    short: "There may be discomfort, noise, crowding, sudden change or a difficult task.",
    title: "Observe before deciding what the behaviour means",
    now: "Check pain, illness and the surroundings, then change one reasonable factor.",
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
    prompt: "I need to slow down",
    label: "I need a pause",
    short: "You are adding words, speaking faster or struggling to choose one next step.",
    title: "Pause before solving",
    now: "Check everyone is safe, then pause and choose only one next action.",
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
