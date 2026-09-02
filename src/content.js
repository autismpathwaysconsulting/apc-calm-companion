export const guideOptions = [
  {
    id: "less-language",
    icon: "words",
    prompt: "I’ve already said too much",
    label: "Use fewer words, then wait",
    short: "The message has become long, repeated or difficult to follow.",
    title: "Make the message shorter",
    now: "Use one short phrase once, then give time for a response.",
    steps: [
      "Check for immediate safety, pain, illness or another urgent need.",
      "Choose one short phrase and pair it with a gesture or object when useful.",
      "Say it once, then wait for a look, movement, gesture, device response or speech.",
    ],
    say: "Shoes on. I’ll wait.",
    notice: "Does less language and more time make the next action easier to identify?",
  },
  {
    id: "next-step",
    icon: "step",
    prompt: "They need one clear next step",
    label: "Show one next step",
    short: "Starting or knowing what happens next is difficult.",
    title: "Make one next step visible",
    now: "Show the smallest useful next action.",
    steps: [
      "Choose the smallest useful next action.",
      "Show or point to that action.",
      "Wait before adding the following step. Use First-Then only if the sequence also needs to be shown.",
    ],
    say: "First, put one book in the bag.",
    notice: "Can the person start when only one concrete step is shown?",
    tools: ["first-then"],
  },
  {
    id: "respond",
    icon: "respond",
    prompt: "They need a way to choose or respond",
    label: "Make responding easier",
    short: "A spoken response has not come yet, or choices need to be shown.",
    title: "Offer an easier way to respond",
    now: "Show two relevant choices or familiar ways to communicate.",
    steps: [
      "Offer only options that are relevant and genuinely available.",
      "Keep the person’s usual communication system available.",
      "Accept a point, reach, look, gesture, device response or speech.",
    ],
    say: "You can point, show me or tell me.",
    notice: "Can the person communicate a choice or need more easily?",
    tools: ["choices", "communication"],
  },
  {
    id: "situation",
    icon: "situation",
    prompt: "Something here may be making this harder",
    label: "Check the situation",
    short: "Safety, comfort, surroundings or the task may need attention.",
    title: "Check what can be made easier",
    now: "Check safety, pain or illness first. Then change one reasonable part of the situation.",
    steps: [
      "Check for pain, illness, hunger, tiredness or a sudden change.",
      "Notice noise, light, crowding, temperature, clothing and task difficulty.",
      "Change one reasonable factor, then observe again.",
    ],
    say: "Let’s make one part easier.",
    notice: "What became easier, stayed difficult or changed after one adjustment?",
  },
];

export const parentPause = {
  id: "parent-pause",
  prompt: "I need to pause",
  label: "Pause before solving",
  short: "Use this when you are speaking faster, adding words or struggling to choose.",
  title: "Give yourself one moment",
  now: "Check immediate safety, take one ordinary breath and choose only one next action.",
  steps: [
    "Check that everyone is safe.",
    "Take one ordinary breath and lower your own verbal load.",
    "Choose only one next action from this page.",
  ],
  say: "I can slow this down.",
  notice: "Does choosing one action make the situation easier to approach?",
};

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

export function secondsUntilDeadline(deadlineMs, nowMs = Date.now()) {
  if (!Number.isFinite(deadlineMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}
