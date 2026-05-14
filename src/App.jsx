import React, { useEffect, useMemo, useState } from "react";

const CJ_PHOTO = "cj-photo.JPG";

function Card({ children, className = "" }) {
  return <section className={`rounded-3xl bg-white shadow-sm ${className}`}>{children}</section>;
}

function Button({ children, onClick, variant = "solid", className = "", type = "button", disabled = false }) {
  const base =
    "inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";
  const style =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
      : "bg-gradient-to-r from-teal-700 to-sky-600 text-white shadow-lg shadow-teal-100 hover:shadow-xl hover:shadow-cyan-100";

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${style} ${className}`}>
      {children}
    </button>
  );
}

function IconBadge({ label, className = "" }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-xl ${className}`}>
      {label}
    </span>
  );
}

const routineTemplates = {
  "Morning Routine": [
    { id: "morning-1", title: "Wake up", icon: "🌤️", done: false },
    { id: "morning-2", title: "Toilet", icon: "🚽", done: false },
    { id: "morning-3", title: "Brush teeth", icon: "🪥", done: false },
    { id: "morning-4", title: "Breakfast", icon: "🥣", done: false },
    { id: "morning-5", title: "Pack bag", icon: "🎒", done: false },
  ],
  "After School": [
    { id: "after-1", title: "Snack", icon: "🍎", done: false },
    { id: "after-2", title: "Rest", icon: "🛋️", done: false },
    { id: "after-3", title: "Homework", icon: "✏️", done: false },
    { id: "after-4", title: "Play", icon: "⚽", done: false },
  ],
  Bedtime: [
    { id: "bed-1", title: "Bath", icon: "🛁", done: false },
    { id: "bed-2", title: "Pyjamas", icon: "👕", done: false },
    { id: "bed-3", title: "Story", icon: "📖", done: false },
    { id: "bed-4", title: "Sleep", icon: "🌙", done: false },
  ],
  "Community Outing": [
    { id: "outing-1", title: "Look at plan", icon: "🗺️", done: false },
    { id: "outing-2", title: "Bring helper item", icon: "🎧", done: false },
    { id: "outing-3", title: "Walk with adult", icon: "🚶", done: false },
    { id: "outing-4", title: "Ask for break", icon: "🪪", done: false },
  ],
};

const calmResets = {
  overwhelmed: {
    label: "My child is overwhelmed",
    icon: "😭",
    title: "Lower the demand first",
    message: "I would pause questions and instructions for now. Your child may need safety, space, and fewer words before they can respond.",
    say: "You are safe. I am here. We can do one small step later.",
    avoid: "Stop crying right now.",
    actions: ["Lower voice", "Use fewer words", "Offer water", "Give quiet space"],
    supports: ["Break card", "Quiet space", "Sensory item", "Water break"],
    insight: "When a child is overloaded, more talking can sometimes make things harder.",
    why: "Reducing language and lowering demands can help the nervous system settle before problem-solving.",
  },
  aggression: {
    label: "Aggression or hitting",
    icon: "🛑",
    title: "Create safety, then reduce demands",
    message: "I would first create space and keep everyone safe. Do not lecture during the peak moment. After calm returns, look for what the behaviour was communicating.",
    say: "I will keep everyone safe. We can talk when your body is calmer.",
    avoid: "Why did you do that? Say sorry now.",
    actions: ["Move back", "Block safely", "Reduce audience", "Use calm voice"],
    supports: ["Safety space", "Break card", "Calm script", "Pattern note"],
    insight: "Aggression can happen when a child has no easier way to communicate distress, escape, pain, fear, or frustration.",
    why: "Safety comes first. Teaching replacement communication works better after the child is calm.",
  },
  speech: {
    label: "Speech or communication difficulty",
    icon: "💬",
    title: "Give a simple way to communicate",
    message: "I would reduce pressure to speak perfectly. Offer a choice, gesture, picture, or short phrase the child can use successfully.",
    say: "You can point, show me, or use one word. I will wait.",
    avoid: "Use your words properly.",
    actions: ["Offer choices", "Wait 5 seconds", "Model words", "Accept gestures"],
    supports: ["Help card", "Choice of 2", "Break card", "All done card"],
    insight: "Communication is more than speech. Behaviour often increases when communication options are too hard.",
    why: "Giving an easier communication method can reduce frustration and increase independence.",
  },
  transition: {
    label: "Transition is difficult",
    icon: "😤",
    title: "Make the next step predictable",
    message: "I would show what is happening now and what comes next. Keep it short: first one step, then something predictable or preferred.",
    say: "First shoes, then car.",
    avoid: "Hurry up, we are late.",
    actions: ["First one step", "Then preferred item", "Show visual", "Give countdown"],
    supports: ["First/Then", "Countdown", "Visual cue", "Choice of 2 options"],
    insight: "Unexpected transitions can increase anxiety, resistance, or meltdowns.",
    why: "Visual sequencing helps the child see the plan instead of relying only on verbal instructions.",
  },
  sensory: {
    label: "Sensory overload",
    icon: "🎧",
    title: "Change the environment before expecting behaviour change",
    message: "I would check noise, lights, crowding, clothing, smell, hunger, and tiredness. Sometimes the support is environmental, not verbal.",
    say: "Let’s make this easier for your body first.",
    avoid: "You are overreacting.",
    actions: ["Reduce noise", "Dim light", "Offer movement", "Use headphones"],
    supports: ["Headphones", "Quiet corner", "Movement break", "Deep pressure"],
    insight: "Some behaviours are responses to sensory overload rather than intentional defiance.",
    why: "Adjusting the environment can reduce distress faster than repeated instructions.",
  },
  refusal: {
    label: "Refusal or non-compliance",
    icon: "🙅",
    title: "Shrink the task",
    message: "I would make the task smaller, clearer, and easier to start. The goal is momentum, not winning a power struggle.",
    say: "Just one small step first. Then we pause.",
    avoid: "You must do it because I said so.",
    actions: ["Make it smaller", "Offer choice", "Use timer", "Praise attempt"],
    supports: ["First/Then", "Choice card", "Timer", "Tiny win"],
    insight: "Refusal can be linked to anxiety, task difficulty, fatigue, unclear expectations, or previous failure.",
    why: "Reducing the starting demand can help the child experience success and continue.",
  },
  public: {
    label: "Public meltdown",
    icon: "🛒",
    title: "Protect calm, not public approval",
    message: "I would focus on safety and reducing stimulation. Other people’s opinions are not the priority in that moment.",
    say: "We are going somewhere quieter. I am with you.",
    avoid: "Everyone is looking at you.",
    actions: ["Move aside", "Reduce talking", "Use break card", "Exit if needed"],
    supports: ["Exit plan", "Break card", "Headphones", "Simple script"],
    insight: "Public meltdowns are often harder because parents feel judged and children are already overloaded.",
    why: "Having a simple exit and recovery plan reduces panic for both parent and child.",
  },
  parent: {
    label: "I feel overwhelmed",
    icon: "😫",
    title: "Pause before solving",
    message: "I would take one breath before deciding what to do. You do not need to fix everything immediately. Choose one small next step.",
    say: "I can pause. I can choose one calm step.",
    avoid: "Why is this happening again?",
    actions: ["Take one breath", "Reduce talking", "Choose one step", "Try again later"],
    supports: ["Reduce demands", "Take one breath", "Connection first", "Simplify language"],
    insight: "Parent stress can unintentionally increase escalation cycles.",
    why: "Small pauses and calmer pacing can support co-regulation.",
  },
};

const supportCards = [
  { title: "Help", icon: "🙋", words: "I need help", color: "from-amber-100 to-yellow-100", speak: "I need help please." },
  { title: "Break", icon: "🧘", words: "Break please", color: "from-sky-100 to-cyan-100", speak: "I need a break." },
  { title: "All done", icon: "✅", words: "All done", color: "from-emerald-100 to-teal-100", speak: "I am all done." },
  { title: "More", icon: "🙌", words: "More please", color: "from-blue-100 to-cyan-100", speak: "More please." },
  { title: "Too loud", icon: "🔊", words: "Too loud", color: "from-orange-100 to-red-100", speak: "It is too loud." },
  { title: "No", icon: "❌", words: "No", color: "from-rose-100 to-pink-100", speak: "No." },
  { title: "Yes", icon: "✔️", words: "Yes", color: "from-green-100 to-emerald-100", speak: "Yes." },
  { title: "Hungry", icon: "🍽️", words: "I’m hungry", color: "from-purple-100 to-fuchsia-100", speak: "I am hungry." },
  { title: "Thirsty", icon: "🥤", words: "I’m thirsty", color: "from-cyan-100 to-blue-100", speak: "I am thirsty." },
  { title: "Toilet", icon: "🚽", words: "Toilet", color: "from-teal-100 to-cyan-100", speak: "I need the toilet." },
  { title: "Tired", icon: "😴", words: "I’m tired", color: "from-indigo-100 to-violet-100", speak: "I am tired." },
  { title: "Happy", icon: "😊", words: "I’m happy", color: "from-yellow-100 to-amber-100", speak: "I am happy." },
];

const evidenceHighlights = [
  { title: "Visual supports", summary: "Visual schedules, first-then boards, and visual cues can support understanding, predictability, and independence for autistic children.", reference: "AFIRM Team. Visual Supports Evidence-Based Practice Brief. University of North Carolina at Chapel Hill.", link: "https://afirm.fpg.unc.edu/visual-supports" },
  { title: "Functional communication", summary: "When children are taught an easier way to communicate needs such as help, break, wait, or all done, challenging behaviour may reduce because the child has a clearer replacement response.", reference: "AFIRM Team. Functional Communication Training Evidence-Based Practice Brief. University of North Carolina at Chapel Hill.", link: "https://afirm.fpg.unc.edu/functional-communication-training" },
  { title: "Antecedent-based supports", summary: "Changing what happens before a behaviour, such as reducing demands, offering choices, adjusting sensory input, or making routines predictable, can prevent escalation.", reference: "AFIRM Team. Antecedent-Based Interventions Evidence-Based Practice Brief. University of North Carolina at Chapel Hill.", link: "https://afirm.fpg.unc.edu/antecedent-based-interventions" },
  { title: "Reinforcement and tiny wins", summary: "Specific reinforcement can help children understand which behaviour is helpful and worth repeating. I would focus on effort, communication, flexibility, and recovery after hard moments.", reference: "AFIRM Team. Reinforcement Evidence-Based Practice Brief. University of North Carolina at Chapel Hill.", link: "https://afirm.fpg.unc.edu/reinforcement" },
];

const parentTools = [
  { title: "First, Then", icon: "1️⃣", description: "Use when the next step feels unclear.", steps: ["Say one first step", "Show what comes after", "Keep the reward realistic", "Praise starting"], toolType: "firstThen" },
  { title: "Visual Timer", icon: "⏱️", description: "Use for waiting, screen time, homework, or leaving.", steps: ["Set the timer", "Say what happens next", "Give one warning", "Follow through calmly"], toolType: "timer" },
  { title: "Calm Down Toolkit", icon: "🌊", description: "Use when emotions are high.", steps: ["Lower your voice", "Pause demands", "Pick one calm option", "Return to teaching later"], toolType: "calm" },
  { title: "Reward Chart", icon: "⭐", description: "Use to make tiny wins visible.", steps: ["Choose one behaviour", "Give stars immediately", "Keep it simple", "Celebrate effort"], toolType: "reward" },
];

function guessIcon(title) {
  const text = String(title || "").toLowerCase();
  if (text.includes("toilet") || text.includes("bathroom")) return "🚽";
  if (text.includes("brush")) return "🪥";
  if (text.includes("eat") || text.includes("breakfast") || text.includes("snack")) return "🍽️";
  if (text.includes("bag") || text.includes("school")) return "🎒";
  if (text.includes("sleep") || text.includes("bed")) return "🌙";
  if (text.includes("bath")) return "🛁";
  if (text.includes("homework") || text.includes("write")) return "✏️";
  if (text.includes("car") || text.includes("go")) return "🚗";
  if (text.includes("break")) return "🧘";
  return "✅";
}

function cloneRoutine(items) {
  return items.map((item) => ({ ...item, id: `${item.id}-${Date.now()}-${Math.random().toString(16).slice(2)}` }));
}

function calculateProgress(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) return 0;
  const completedCount = schedule.filter((item) => item && item.done === true).length;
  return Math.round((completedCount / schedule.length) * 100);
}

function countCompleted(schedule) {
  if (!Array.isArray(schedule)) return 0;
  return schedule.filter((item) => item && item.done === true).length;
}

function createScheduleItem(title) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return null;
  return { id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`, title: cleanTitle, icon: guessIcon(cleanTitle), done: false };
}

function hasAnyNoteText(note) {
  if (!note || typeof note !== "object") return false;
  return Boolean(String(note.before || "").trim() || String(note.during || "").trim() || String(note.helped || "").trim());
}

function createQuickNote(note) {
  if (!hasAnyNoteText(note)) return null;
  return { id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`, before: String(note.before || "").trim(), during: String(note.during || "").trim(), helped: String(note.helped || "").trim(), date: new Date().toLocaleDateString() };
}

const selfTests = [
  { name: "Progress is 0 when schedule is empty", passed: calculateProgress([]) === 0 },
  { name: "Progress calculates completed routine steps", passed: calculateProgress([{ done: true }, { done: false }, { done: true }, { done: false }]) === 50 },
  { name: "Blank routine step is rejected", passed: createScheduleItem("   ") === null },
  { name: "Created routine item is incomplete by default", passed: createScheduleItem("Pack lunch")?.done === false },
  { name: "Added toilet step gets toilet icon", passed: createScheduleItem("go toilet")?.icon === "🚽" },
  { name: "AAC board has at least 12 communication buttons", passed: supportCards.length >= 12 },
  { name: "Evidence items include references and links", passed: evidenceHighlights.every((item) => Boolean(item.reference && item.link)) },
  { name: "Parent tools include usable tool types", passed: parentTools.every((tool) => Boolean(tool.toolType)) },
];

function getSavedAppData() {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem("apc-calm-companion-data");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

export default function AutismDailySupportToolkit() {
  const savedAppData = getSavedAppData();  const [selectedTemplate, setSelectedTemplate] = useState("Morning Routine");
const [schedule, setSchedule] = useState(() => savedAppData?.schedule || cloneRoutine(routineTemplates["Morning Routine"]));  const [newTask, setNewTask] = useState("");
  const [activeReset, setActiveReset] = useState("overwhelmed");
const [stars, setStars] = useState(savedAppData?.stars ?? 3);  const [note, setNote] = useState({ before: "", during: "", helped: "" });
const [savedNotes, setSavedNotes] = useState(savedAppData?.savedNotes || []);  const [openEvidence, setOpenEvidence] = useState("Visual supports");
  const [activeTool, setActiveTool] = useState(parentTools[0]);
  const [childMode, setChildMode] = useState("parent-guided");
const [selectedDate, setSelectedDate] = useState(() => savedAppData?.selectedDate || new Date().toISOString().slice(0, 10));  const [firstTask, setFirstTask] = useState("Shoes");
  const [thenTask, setThenTask] = useState("Car");
const [timerMinutes, setTimerMinutes] = useState(savedAppData?.timerMinutes || 5);  const [timerPurpose, setTimerPurpose] = useState(savedAppData?.timerPurpose || "Homework time");
  const [timerRemaining, setTimerRemaining] = useState(() => (savedAppData?.timerMinutes || 5) * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedTaskIcon, setSelectedTaskIcon] = useState("✅");
  const [childPhotoLabel, setChildPhotoLabel] = useState("No photo added yet");
const [rewardLog, setRewardLog] = useState(savedAppData?.rewardLog || []);
  const [communicationPhrase, setCommunicationPhrase] = useState("Tap a card to speak");
const [xp, setXp] = useState(savedAppData?.xp || 120);  const [streak, setStreak] = useState(savedAppData?.streak || 3);
  const [focusMode, setFocusMode] = useState(false);
  const [bedtimeMode, setBedtimeMode] = useState(false);
const [favouriteTools, setFavouriteTools] = useState(savedAppData?.favouriteTools || ["Calm Down Toolkit"]);
const [onboardingComplete, setOnboardingComplete] = useState(savedAppData?.onboardingComplete || false);
const [childName, setChildName] = useState(savedAppData?.childName || "My Child");  
const [mainChallenge, setMainChallenge] = useState(savedAppData?.mainChallenge || "Aggression / hitting");  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [activeQuickTool, setActiveQuickTool] = useState("timer");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("ready");
  const [breathingCount, setBreathingCount] = useState(4);
  const [timerVisualMode, setTimerVisualMode] = useState("circle");

  const visualChoices = [
    ["✅", "General"],
    ["📚", "Homework"],
    ["✏️", "Writing"],
    ["🎒", "School bag"],
    ["🏫", "Go school"],
    ["🪥", "Brush teeth"],
    ["🚽", "Toilet"],
    ["🍽️", "Eat"],
    ["🛁", "Bath"],
    ["🌙", "Sleep"],
    ["🚗", "Car"],
    ["🧘", "Break"],
    ["🎧", "Headphones"],
    ["🧸", "Toy"],
    ["📱", "Screen time"],
  ];

  const rewardDescriptions = [
    "Asked for help",
    "Tried one step",
    "Used calm body",
    "Waited",
    "Recovered after a hard moment",
  ];
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Saved on this device");

  const reset = calmResets[activeReset];
  const completedCount = useMemo(() => countCompleted(schedule), [schedule]);
  const progress = useMemo(() => calculateProgress(schedule), [schedule]);
  const canSaveNote = hasAnyNoteText(note);
  const passedTestCount = selfTests.filter((test) => test.passed).length;
  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const todayLabel = dateObj.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const shortDate = dateObj.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const levelProgress = xp % 100;
  useEffect(() => {
  const appState = {
    childName,
    schedule,
    stars,
    savedNotes,
    rewardLog,
    timerPurpose,
    timerMinutes,
    xp,
    streak,
    selectedDate,
    mainChallenge,
    onboardingComplete,
    favouriteTools,
  };

  try {
    window.localStorage.setItem("apc-calm-companion-data", JSON.stringify(appState));
    setSaveMessage("Saved on this device");
  } catch (error) {
    setSaveMessage("Saving unavailable in this browser");
  }
}, [
  childName,
  schedule,
  stars,
  savedNotes,
  rewardLog,
  timerPurpose,
  timerMinutes,
  xp,
  streak,
  selectedDate,
  mainChallenge,
  onboardingComplete,
  favouriteTools,
]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!breathingActive) {
      setBreathingPhase("ready");
      setBreathingCount(4);
      return;
    }

    let phase = "inhale";
    let count = 4;
    setBreathingPhase(phase);
    setBreathingCount(count);

    const interval = window.setInterval(() => {
      count -= 1;

      if (count <= 0) {
        if (phase === "inhale") {
          phase = "hold";
          count = 2;
        } else if (phase === "hold") {
          phase = "exhale";
          count = 6;
        } else {
          phase = "inhale";
          count = 4;
        }
      }

      setBreathingPhase(phase);
      setBreathingCount(count);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [breathingActive]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setTimerRemaining((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    setShowInstallHelp((value) => !value);
  }
function resetSavedData() {
  const confirmReset = window.confirm("Reset saved APC Calm Companion data on this device?");
  if (!confirmReset) return;

  window.localStorage.removeItem("apc-calm-companion-data");
  window.location.reload();
}
  function goToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseScenario(key) {
    setActiveReset(key);
    window.setTimeout(() => {
      goToSection("recommendation-panel");
    }, 80);
  }

  function selectTemplate(templateName) {
    setSelectedTemplate(templateName);
    setSchedule(cloneRoutine(routineTemplates[templateName]));
  }

  function toggleTask(id) {
    setSchedule((items) => items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
    setXp((value) => value + 5);
  }

  function addTask() {
    const item = createScheduleItem(newTask);
    if (!item) return;
    item.icon = selectedTaskIcon || item.icon;
    setSchedule((items) => [...items, item]);
    setNewTask("");
    setXp((value) => value + 3);
  }

  function removeTask(id) {
    setSchedule((items) => items.filter((item) => item.id !== id));
  }

  function saveReward() {
    setRewardLog((items) => [
      {
        id: `reward-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        stars,
        descriptions: rewardDescriptions.slice(0, stars),
      },
      ...items,
    ]);
    setXp((value) => value + 10);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerRemaining(timerMinutes * 60);
  }

  function updateTimerMinutes(value) {
    setTimerMinutes(value);
    setTimerRemaining(value * 60);
    setTimerRunning(false);
  }

  function saveNote() {
    const nextNote = createQuickNote(note);
    if (!nextNote) return;
    setSavedNotes((items) => [nextNote, ...items]);
    setNote({ before: "", during: "", helped: "" });
    setXp((value) => value + 10);
  }

  function useCommunicationCard(card) {
    setCommunicationPhrase(card.speak);
    setXp((value) => value + 2);

    if (voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.speak);
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  function toggleFavourite(toolTitle) {
    setFavouriteTools((current) =>
      current.includes(toolTitle)
        ? current.filter((item) => item !== toolTitle)
        : [...current, toolTitle]
    );
  }

  function openParentTool(tool) {
    setActiveTool(tool);
    setActiveQuickTool(tool.toolType);
    window.setTimeout(() => {
      goToSection("quick-tools");
    }, 80);
  }

  function openQuickTool(toolType) {
    setActiveQuickTool(toolType);
    window.setTimeout(() => {
      goToSection("active-tool-view");
    }, 80);
  }

  function sendSummaryToCJ() {
    const completedSteps = schedule
      .filter((item) => item.done)
      .map((item) => item.title);

    const pendingSteps = schedule
      .filter((item) => !item.done)
      .map((item) => item.title);

    const latestNotes = savedNotes
      .slice(0, 3)
      .map((item, index) => {
        return [
          `Note ${index + 1}:`,
          `Before: ${item.before || "Not recorded"}`,
          `During: ${item.during || "Not recorded"}`,
          `Helped: ${item.helped || "Not recorded"}`,
        ].join("\n");
      })
      .join("\n\n");

    const latestRewards = rewardLog
      .slice(0, 3)
      .map((item) => `${item.date}: ${item.stars}/5 stars`)
      .join("\n");

    const message = [
      "Hi CJ, I used the APC Calm Companion and would like to share a short summary.",
      "",
      `Child name: ${childName || "Not added"}`,
      `Main challenge: ${mainChallenge || "Not selected"}`,
      `Selected date: ${todayLabel}`,
      `Current timer: ${timerPurpose}, ${timerMinutes} minute(s)`,
      "",
      "Routine progress:",
      `Completed: ${completedSteps.length ? completedSteps.join(", ") : "None yet"}`,
      `Still working on: ${pendingSteps.length ? pendingSteps.join(", ") : "None"}`,
      "",
      "Latest pattern notes:",
      latestNotes || "No pattern notes saved yet.",
      "",
      "Reward log:",
      latestRewards || "No reward log saved yet.",
      "",
      "I understand this is not emergency support. I would like guidance on what to try next.",
    ].join("\n");

    window.open(
      `https://wa.me/601172998168?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className={`min-h-screen text-slate-900 transition-all duration-300 ${bedtimeMode ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" : "bg-gradient-to-b from-[#F4FBFA] via-white to-[#F7FAFC]"}`}>
      <div className="mx-auto w-full max-w-[430px] px-4 py-6 md:max-w-7xl md:px-8 md:py-10">
        {!onboardingComplete && (
          <section className="mb-6 rounded-[2rem] border border-teal-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">✨ Welcome to APC Calm Companion</div>
                <h2 className="mt-3 text-3xl font-bold">Let me personalise support for your family</h2>
                <p className="mt-2 max-w-2xl leading-7 text-slate-600">This takes less than 30 seconds. I’ll prioritise the tools parents usually need most.</p>
              </div>
              <Button onClick={() => setOnboardingComplete(true)}>Save preferences</Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">Child name</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <label className="mt-4 block text-sm font-bold text-slate-700">Child photo</label>
                <div className="mt-2 rounded-2xl border border-dashed border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
                  {childPhotoLabel}. For beta, parents can add a name first. Photo upload can be added when login/storage is ready.
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Biggest challenge right now</label>
                <select value={mainChallenge} onChange={(e) => setMainChallenge(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option>Aggression / hitting</option>
                  <option>Speech / communication</option>
                  <option>Meltdowns</option>
                  <option>Transitions</option>
                  <option>Sleep</option>
                  <option>Sensory overload</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {focusMode && (
          <section className="mb-6 rounded-[2rem] border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-rose-600">🚨 Focus Mode Active</div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Things are escalating</h2>
                <p className="mt-2 max-w-2xl text-lg leading-7 text-slate-700">Lower demands. Use fewer words. Focus on safety first. You do not need to solve everything immediately.</p>
              </div>
              <Button variant="outline" onClick={() => setFocusMode(false)}>Exit focus mode</Button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-4xl">🧘</div><h3 className="mt-3 text-lg font-bold">Say less</h3><p className="mt-2 text-sm leading-6 text-slate-600">Short phrases are easier to process during distress.</p></div>
              <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-4xl">🎧</div><h3 className="mt-3 text-lg font-bold">Reduce sensory input</h3><p className="mt-2 text-sm leading-6 text-slate-600">Lower noise, lights, crowding, and pressure.</p></div>
              <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-4xl">💜</div><h3 className="mt-3 text-lg font-bold">Connection first</h3><p className="mt-2 text-sm leading-6 text-slate-600">Regulation before reasoning.</p></div>
            </div>
          </section>
        )}

        <header className="mb-8 grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
          <Card className="border border-teal-100">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                <IconBadge label="🤝" className="h-7 w-7 text-base" />
                Autism Pathways Consulting
              </div>

              <div className="grid gap-5 text-center md:grid-cols-[116px_1fr] md:items-center md:text-left">
                <img src={CJ_PHOTO} alt="CJ from Autism Pathways Consulting" className="mx-auto h-28 w-28 rounded-[2rem] object-cover shadow-lg ring-4 ring-white md:mx-0" />
                <div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">APC Calm Companion</h1>
                  <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-slate-600 md:mx-0 md:text-lg">
                    I’ll help you choose one calm next step, give you the words to say, and open the right tool when you need it.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Button onClick={() => goToSection("calm-reset")} className="h-14 w-full text-base">Start calm support</Button>
                <Button variant="outline" onClick={() => goToSection("parent-support")} className="h-14 w-full text-base">Open parent tools</Button>
                <Button variant="outline" onClick={() => setFocusMode(true)} className="h-14 w-full text-base">Emergency calm mode</Button>
                <Button variant="outline" onClick={() => setBedtimeMode((value) => !value)} className="h-14 w-full text-base">{bedtimeMode ? "Exit bedtime mode" : "Bedtime mode"}</Button>
                <Button variant="outline" onClick={installApp} className="h-14 w-full text-base">Install app</Button>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-100">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Selected day</p>
                  <h2 className="mt-1 text-2xl font-bold">{todayLabel}</h2>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 px-5 py-4 text-center text-white shadow-lg shadow-cyan-100">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-80">Date</p>
                  <p className="text-2xl font-bold">{shortDate}</p>
                </div>
              </div>

              <input value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} type="date" className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-teal-500" />
              <div className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
  <p className="font-bold">{saveMessage}</p>
  <p>Your child name, routines, notes, reward log, and timer settings are saved on this phone or computer.</p>
  <button
    type="button"
    onClick={resetSavedData}
    className="mt-2 text-xs font-bold text-emerald-800 underline"
  >
    Reset saved data
  </button>
</div>

              <div className="mt-5 rounded-3xl bg-[#EEF6FF] p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-teal-900">{childName}'s progress</p><p className="text-sm font-bold text-sky-700">🔥 {streak} day streak</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-sky-500" style={{ width: `${levelProgress}%` }} /></div><p className="mt-2 text-xs font-semibold text-sky-700">Calmer routines and small wins build confidence over time.</p></div>

              {showInstallHelp && (
                <div className="mt-5 rounded-3xl bg-sky-50 p-5 text-sm leading-6 text-sky-900">
                  <p className="font-bold">Install APC Calm Companion on your phone</p>
                  <p className="mt-2"><strong>iPhone:</strong> Open in Safari → Share → Add to Home Screen.</p>
                  <p><strong>Android:</strong> Open in Chrome → Menu → Add to Home Screen or Install app.</p>
                </div>
              )}
            </div>
          </Card>
        </header>

        <section id="calm-reset" className="mb-8 rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">✨ APC Calm Reset</div>
              <h2 className="text-2xl font-bold md:text-3xl">What should I do right now?</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Choose the closest situation. I’ll give you what to say, what to avoid, what to do, and which tool to open.</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {Object.entries(calmResets).map(([key, item]) => (
                  <Button key={key} variant={activeReset === key ? "solid" : "outline"} className="min-h-16 w-full justify-center text-center text-base md:justify-start md:text-left" onClick={() => chooseScenario(key)}>
                    <span className="mr-2 text-xl">{item.icon}</span>{item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div id="recommendation-panel" className="scroll-mt-6 rounded-[2rem] bg-gradient-to-br from-slate-50 to-cyan-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">I recommend</p>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm">{reset.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-bold">{reset.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{reset.message}</p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {reset.actions.map((action) => <div key={action} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm">✅ {action}</div>)}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-teal-600">Say this</p><p className="mt-3 text-lg font-semibold leading-7 text-slate-800">“{reset.say}”</p></div>
                    <div className="rounded-3xl bg-rose-50 p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-rose-600">Try not to say this</p><p className="mt-3 text-lg font-semibold leading-7 text-slate-800">“{reset.avoid}”</p></div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Open a tool for this</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {reset.supports.map((support) => (
                        <button key={support} type="button" onClick={() => openQuickTool(support.toLowerCase().includes("timer") || support.toLowerCase().includes("countdown") ? "timer" : support.toLowerCase().includes("first") ? "firstThen" : support.toLowerCase().includes("break") || support.toLowerCase().includes("calm") || support.toLowerCase().includes("quiet") || support.toLowerCase().includes("sensory") ? "calm" : "communication")} className="rounded-2xl bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-900 transition hover:bg-cyan-100">{support}</button>
                      ))}
                    </div>
                  </div>

                  <details className="mt-6 rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5">
                    <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-teal-700">Why I recommend this</summary>
                    <h4 className="mt-3 text-lg font-bold text-slate-800">{reset.insight}</h4>
                    <p className="mt-2 leading-7 text-slate-600">{reset.why}</p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">📚 Optional research notes</div>
              <h2 className="mt-3 text-2xl font-bold">Evidence, but only when you want it</h2>
              <p className="mt-2 max-w-3xl leading-7 text-slate-600">You do not need to read research during stressful moments. This section is here if you want reassurance that the strategies are evidence-informed.</p>
            </div>
            <select value={openEvidence} onChange={(event) => setOpenEvidence(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500">
              {evidenceHighlights.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}
            </select>
          </div>

          {evidenceHighlights.filter((item) => item.title === openEvidence).map((item) => (
            <div key={item.title} className="mt-6 grid gap-4 rounded-[2rem] border border-teal-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-5 md:grid-cols-[1fr_0.7fr]">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{item.summary}</p>
                <p className="mt-4 text-sm font-semibold text-slate-500">Reference: {item.reference}</p>
                <a className="mt-2 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-sm underline" href={item.link} target="_blank" rel="noreferrer">Open source</a>
              </div>
              <div className="flex items-center justify-center rounded-[2rem] bg-white/70 p-6 text-7xl shadow-inner">📘</div>
            </div>
          ))}
        </section>

        <section id="independence" className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="border border-teal-100 lg:col-span-2">
            <div className="p-6">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3"><IconBadge label="👆" /><div><p className="text-sm font-medium text-slate-500">Child independence mode</p><h2 className="text-2xl font-bold">Show the routine, then let your child tap</h2></div></div>
                <select value={selectedTemplate} onChange={(event) => selectTemplate(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500">
                  {Object.keys(routineTemplates).map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[['parent-guided','1. Parent shows phone'],['child-taps','2. Child taps step'],['fade-prompt','3. Fade prompts']].map(([key,label]) => (
                  <button key={key} type="button" onClick={() => setChildMode(key)} className={`rounded-3xl p-4 text-left text-sm font-semibold ${childMode === key ? "bg-teal-600 text-white" : "bg-cyan-50 text-cyan-900"}`}>{label}</button>
                ))}
              </div>
              <div className="mt-4 rounded-3xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-900">
                {childMode === "parent-guided" && "Start by holding the phone or tablet where your child can see it. Point to the first step and say it once."}
                {childMode === "child-taps" && "After the step is completed, invite your child to tap the card. This gives a clear finish point."}
                {childMode === "fade-prompt" && "Once your child understands the routine, stand nearby and wait. Let the visual do more work."}
              </div>

              <div className="mt-5 grid gap-3">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                    <button type="button" onClick={() => toggleTask(item.id)} className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-3xl shadow-sm transition-all ${item.done ? "bg-teal-100" : "bg-slate-100 hover:bg-cyan-50"}`}>{item.done ? "✅" : item.icon}</button>
                    <button type="button" onClick={() => toggleTask(item.id)} className={`flex-1 text-left text-xl font-bold ${item.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.title}</button>
                    <button type="button" onClick={() => removeTask(item.id)} className="rounded-2xl p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700">🗑️</button>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <div className="grid gap-2 md:grid-cols-[1fr_190px]">
                  <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} placeholder="Add one simple step, e.g. brush teeth" className="min-w-0 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500" />
                  <select value={selectedTaskIcon} onChange={(event) => setSelectedTaskIcon(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-teal-500">
                    {visualChoices.map(([icon, label]) => (
                      <option key={label} value={icon}>{icon} {label}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={addTask}>Add step + visual</Button>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">You can choose the visual icon yourself. This prevents repeated visuals, such as school bag and go school looking the same.</p>
            </div>
          </Card>

          <Card className="border border-slate-100">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3"><IconBadge label="💬" /><div><p className="text-sm font-medium text-slate-500">Child communication</p><h2 className="text-2xl font-bold">Big tap board</h2></div></div>
              <div className="mb-4 rounded-[2rem] bg-gradient-to-r from-teal-700 to-sky-600 p-5 text-center text-white shadow-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Child selected</p><p className="mt-2 text-2xl font-bold leading-relaxed">{communicationPhrase}</p><div className="mt-4 flex flex-wrap items-center justify-center gap-2"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => setVoiceEnabled((value) => !value)}>{voiceEnabled ? "🔊 Voice ON" : "🔈 Voice OFF"}</Button><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">📱 Fullscreen AAC</Button></div></div>
              <div className="grid grid-cols-2 gap-3">
                {supportCards.map((card) => (
                  <button key={card.title} type="button" onClick={() => useCommunicationCard(card)} className={`flex min-h-32 flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${card.color} p-4 text-center shadow-sm ring-1 ring-white/60 transition-all hover:-translate-y-1 hover:shadow-lg`}>
                    <div className="text-5xl">{card.icon}</div><h3 className="mt-2 text-lg font-extrabold">{card.title}</h3><p className="text-sm font-semibold text-slate-700">{card.words}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section id="quick-tools" className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">⚡ Everyday support tools</div>
              <h2 className="mt-3 text-2xl font-bold">Choose one tool to show your child</h2>
              <p className="mt-2 max-w-2xl leading-7 text-slate-600">To avoid overwhelming your child, only one tool opens at a time. Use the tabs, then show that one screen to your child.</p>
            </div>
            <Button variant="outline" onClick={() => goToSection("parent-support")}>View parent instructions</Button>
          </div>

          <div className="mb-5 grid gap-2 sm:grid-cols-4">
            {[
              ["firstThen", "1️⃣ First / Then"],
              ["timer", "⏱️ Timer"],
              ["calm", "🌬️ Calm Down"],
              ["reward", "⭐ Reward"],
            ].map(([toolType, label]) => (
              <button
                key={toolType}
                type="button"
                onClick={() => setActiveQuickTool(toolType)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${activeQuickTool === toolType ? "bg-teal-700 text-white shadow-lg" : "bg-slate-50 text-slate-700 hover:bg-cyan-50"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div id="active-tool-view" className="scroll-mt-6 rounded-[2rem] border border-teal-100 bg-gradient-to-br from-cyan-50 to-white p-5">
            {activeQuickTool === "firstThen" && (
              <div>
                <h3 className="text-2xl font-bold">First / Then Board</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Show only this board to your child. Keep your words short and point to each side.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">First</p>
                    <input value={firstTask} onChange={(e)=>setFirstTask(e.target.value)} className="mt-3 w-full rounded-2xl border p-3 text-center text-xl font-bold" />
                    <div className="mt-4 text-6xl">{guessIcon(firstTask)}</div>
                  </div>
                  <div className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Then</p>
                    <input value={thenTask} onChange={(e)=>setThenTask(e.target.value)} className="mt-3 w-full rounded-2xl border p-3 text-center text-xl font-bold" />
                    <div className="mt-4 text-6xl">{guessIcon(thenTask)}</div>
                  </div>
                </div>
                <div className="mt-5 rounded-3xl bg-teal-700 p-5 text-center text-2xl font-bold text-white">First {firstTask} → Then {thenTask}</div>
              </div>
            )}

            {activeQuickTool === "timer" && (
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Visual Timer</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Set what the timer is for, then press start. Show this one screen to your child so they can see how much time is left.</p>
                  </div>
                  <select value={timerVisualMode} onChange={(e)=>setTimerVisualMode(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold">
                    <option value="circle">Circle timer</option>
                    <option value="bar">Bar timer</option>
                  </select>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px]">
                  <input value={timerPurpose} onChange={(e)=>setTimerPurpose(e.target.value)} placeholder="What is this timer for?" className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-teal-500" />
                  <select value={timerVisualMode} onChange={(e)=>setTimerVisualMode(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold">
                    <option value="circle">Circle timer</option>
                    <option value="bar">Bar timer</option>
                  </select>
                </div>
                <input type="range" min="1" max="30" value={timerMinutes} onChange={(e)=>updateTimerMinutes(Number(e.target.value))} className="mt-6 w-full" />
                {timerVisualMode === "circle" ? (
                  <div className="mt-6 flex justify-center">
                    <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-white shadow-inner" style={{ background: `conic-gradient(#0f766e ${(timerRemaining / (timerMinutes * 60 || 1)) * 360}deg, #dbeafe 0deg)` }}>
                      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white shadow-lg">
                        <p className="text-5xl font-black text-teal-800">{Math.floor(timerRemaining / 60)}:{String(timerRemaining % 60).padStart(2, "0")}</p>
                        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{timerPurpose}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl bg-white p-5 shadow-inner">
                    <div className="h-10 overflow-hidden rounded-full bg-sky-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-sky-500" style={{ width: `${(timerRemaining / (timerMinutes * 60 || 1)) * 100}%` }} />
                    </div>
                    <p className="mt-4 text-center text-4xl font-black text-teal-800">{Math.floor(timerRemaining / 60)}:{String(timerRemaining % 60).padStart(2, "0")}</p>
                    <p className="mt-1 text-center text-sm font-bold text-slate-500">{timerPurpose}</p>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? "Pause timer" : "Start timer"}</Button>
                  <Button variant="outline" onClick={resetTimer}>Reset timer</Button>
                </div>
              </div>
            )}

            {activeQuickTool === "calm" && (
              <div>
                <h3 className="text-2xl font-bold">Automatic Calm Breathing</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Press start, then follow the circle. It expands for breathe in, pauses for hold, and slowly closes for breathe out.</p>

                <div className="mt-6 flex flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-50 to-sky-50 p-8 text-center">
                  <div className="relative flex h-64 w-64 items-center justify-center">
                    <div
                      className={`absolute rounded-full border-8 transition-all ease-in-out ${
                        breathingPhase === "inhale"
                          ? "h-64 w-64 border-teal-500 opacity-80 duration-[4000ms]"
                          : breathingPhase === "hold"
                          ? "h-64 w-64 border-sky-500 opacity-70 duration-1000"
                          : breathingPhase === "exhale"
                          ? "h-36 w-36 border-teal-300 opacity-90 duration-[6000ms]"
                          : "h-44 w-44 border-slate-300 opacity-60 duration-1000"
                      }`}
                    />
                    <div
                      className={`absolute rounded-full bg-gradient-to-br from-teal-500 to-sky-500 shadow-2xl transition-all ease-in-out ${
                        breathingPhase === "inhale"
                          ? "h-48 w-48 duration-[4000ms]"
                          : breathingPhase === "hold"
                          ? "h-48 w-48 duration-1000"
                          : breathingPhase === "exhale"
                          ? "h-28 w-28 duration-[6000ms]"
                          : "h-36 w-36 duration-1000"
                      }`}
                    />
                    <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white/95 shadow-lg">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        {breathingPhase === "ready" && "Ready"}
                        {breathingPhase === "inhale" && "Breathe in"}
                        {breathingPhase === "hold" && "Hold"}
                        {breathingPhase === "exhale" && "Breathe out"}
                      </p>
                      <p className="mt-1 text-5xl font-black text-teal-800">{breathingActive ? breathingCount : ""}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button onClick={() => setBreathingActive((value) => !value)}>{breathingActive ? "Stop breathing guide" : "Start breathing guide"}</Button>
                    <Button variant="outline" onClick={() => { setBreathingActive(false); setBreathingPhase("ready"); setBreathingCount(4); }}>Reset</Button>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-3">
                    <div className={`rounded-2xl p-3 ${breathingPhase === "inhale" ? "bg-teal-600 text-white" : "bg-white"}`}>🌬️ Breathe in 4</div>
                    <div className={`rounded-2xl p-3 ${breathingPhase === "hold" ? "bg-sky-600 text-white" : "bg-white"}`}>⏸️ Hold 2</div>
                    <div className={`rounded-2xl p-3 ${breathingPhase === "exhale" ? "bg-teal-600 text-white" : "bg-white"}`}>🍃 Breathe out 6</div>
                  </div>
                </div>
              </div>
            )}

            {activeQuickTool === "reward" && (
              <div>
                <h3 className="text-2xl font-bold">Tiny Wins Reward Board</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use this for effort, communication, trying again, waiting, and flexibility.</p>
                <div className="mt-6 rounded-[2rem] bg-amber-50 p-6 text-center">
                  <div className="flex flex-wrap justify-center gap-2 text-5xl">{Array.from({ length: 5 }).map((_, i)=><button key={i} onClick={()=>setStars(i+1)}>{i < stars ? "⭐" : "☆"}</button>)}</div>
                  <p className="mt-5 text-xl font-bold text-amber-900">{stars}/5 tiny wins today</p>
                  <div className="mt-4 grid gap-2 text-left">
                    {rewardDescriptions.map((description, index) => (
                      <div key={description} className={`rounded-2xl p-3 text-sm font-semibold ${index < stars ? "bg-white text-amber-900" : "bg-white/50 text-slate-400"}`}>
                        {index < stars ? "⭐" : "☆"} {description}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button onClick={saveReward}>Save reward log</Button>
                    <Button variant="outline" onClick={() => setStars(0)}>Reset stars</Button>
                  </div>
                  {rewardLog.length > 0 && (
                    <div className="mt-5 rounded-3xl bg-white p-4 text-left shadow-sm">
                      <p className="text-sm font-bold text-slate-700">Reward log</p>
                      <div className="mt-3 grid gap-2">
                        {rewardLog.slice(0, 3).map((item) => (
                          <div key={item.id} className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                            {item.date}: {item.stars}/5 stars
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="parent-support" className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="border border-slate-100 lg:col-span-2">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3"><IconBadge label="🧰" /><div><p className="text-sm font-medium text-slate-500">Parent support</p><h2 className="text-2xl font-bold">Click a tool and I’ll show you how to use it</h2></div></div>
              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-3">{parentTools.map((tool) => <button key={tool.title} type="button" onClick={() => openParentTool(tool)} className={`rounded-3xl p-4 text-left transition-all ${activeTool.title === tool.title ? "bg-teal-600 text-white shadow-lg" : "bg-slate-50 hover:bg-cyan-50"}`}><div className="flex items-center gap-3"><span className="text-3xl">{tool.icon}</span><div><h3 className="font-bold">{tool.title}</h3><p className={`mt-1 text-sm leading-5 ${activeTool.title === tool.title ? "text-white/85" : "text-slate-600"}`}>{tool.description}</p></div></div></button>)}</div>
                <div className="rounded-[2rem] bg-gradient-to-br from-cyan-50 to-teal-50 p-5"><div className="text-4xl">{activeTool.icon}</div><h3 className="mt-3 text-2xl font-bold">{activeTool.title}</h3><p className="mt-2 leading-7 text-slate-600">{activeTool.description}</p><div className="mt-5 grid gap-3">{activeTool.steps.map((step, index) => <div key={step} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">{index + 1}</div><p className="text-sm font-semibold leading-6 text-slate-700">{step}</p></div>)}</div><Button className="mt-5 w-full" onClick={() => openQuickTool(activeTool.toolType)}>Open this tool</Button></div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-100">
            <div className="p-6"><h2 className="text-2xl font-bold">Quick Pattern Note</h2><p className="mt-2 text-sm leading-6 text-slate-600">Write one or two lines so we can spot patterns later.</p><div className="mt-5 grid gap-3"><textarea value={note.before} onChange={(event) => setNote({ ...note, before: event.target.value })} placeholder="Before: what happened?" className="min-h-24 rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-teal-500" /><textarea value={note.during} onChange={(event) => setNote({ ...note, during: event.target.value })} placeholder="During: what did you notice?" className="min-h-24 rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-teal-500" /><textarea value={note.helped} onChange={(event) => setNote({ ...note, helped: event.target.value })} placeholder="What helped?" className="min-h-24 rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-teal-500" /></div><Button onClick={saveNote} disabled={!canSaveNote} className="mt-4 w-full">Save note + XP</Button>{savedNotes.length > 0 && <div className="mt-5 grid gap-3">{savedNotes.map((savedNote) => <div key={savedNote.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-100"><p className="font-bold">{savedNote.date}</p><p className="mt-2"><strong>Before:</strong> {savedNote.before || "Not recorded"}</p><p><strong>During:</strong> {savedNote.during || "Not recorded"}</p><p><strong>Helped:</strong> {savedNote.helped || "Not recorded"}</p></div>)}</div>}</div>
          </Card>
        </section>

        <Card className="border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50"><div className="p-6"><div className="flex items-center gap-3"><IconBadge label="💜" /><div><p className="text-sm font-medium text-slate-500">APC Support Philosophy</p><h2 className="text-2xl font-bold">Simple support parents can actually use</h2></div></div><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-3xl">🧠</div><h3 className="mt-3 text-lg font-bold">Reduce overwhelm first</h3><p className="mt-2 text-sm leading-6 text-slate-600">Parents often do not need more information. They need calmer next steps during hard moments.</p></div><div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-3xl">👨‍👩‍👧</div><h3 className="mt-3 text-lg font-bold">Built for real families</h3><p className="mt-2 text-sm leading-6 text-slate-600">The app focuses on routines, communication, regulation, transitions, and everyday independence.</p></div><div className="rounded-3xl bg-white p-5 shadow-sm"><div className="text-3xl">✨</div><h3 className="mt-3 text-lg font-bold">Practical over perfect</h3><p className="mt-2 text-sm leading-6 text-slate-600">Tiny wins, calmer moments, and easier communication matter more than perfect behaviour.</p></div></div></div></Card>

        <section className="mt-8 rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-700 to-sky-700 p-6 text-white shadow-xl">
          <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/70">Want more support?</p>
              <h2 className="mt-2 text-3xl font-black">Watch APC parent support videos</h2>
              <p className="mt-3 leading-7 text-white/85">I’ll add short videos here for meltdowns, aggression, communication, routines, transitions, and parent overwhelm.</p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Nothing is sent automatically. You choose when to share your summary with CJ.
              </p>
            </div>
            <div className="grid gap-3">
              <a href="https://autismpathwaysconsulting.com" target="_blank" rel="noreferrer" className="rounded-2xl bg-white px-5 py-4 text-center font-bold text-teal-800 shadow-lg">Visit APC website</a>
              <button
                type="button"
                onClick={sendSummaryToCJ}
                className="rounded-2xl bg-white px-5 py-4 text-center font-bold text-teal-800 shadow-lg"
              >
                Send summary to CJ
              </button>
              <a href="https://autismpathwaysconsulting.com/services" target="_blank" rel="noreferrer" className="rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white ring-1 ring-white/30">1:1 Parent Support & Strategy Session</a>
              <a href="https://www.instagram.com/autismpathwaysconsulting" target="_blank" rel="noreferrer" className="rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white ring-1 ring-white/30">Watch APC tips</a>
              <a href="mailto:cjlim@autismpathwaysconsulting.com?subject=APC%20Calm%20Companion%20Feedback&body=Hi%20CJ%2C%0A%0AI%20tried%20APC%20Calm%20Companion.%0A%0AWhat%20helped%20most%3A%0A%0AWhat%20felt%20confusing%3A%0A%0AWhat%20I%20wish%20the%20app%20had%3A%0A%0A" className="rounded-2xl bg-white px-5 py-4 text-center font-bold text-teal-800 shadow-lg">Send feedback</a>
            </div>
          </div>
        </section>

        <footer className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 text-center text-sm leading-6 text-slate-600 shadow-sm">
          <p className="font-bold text-slate-900">© Autism Pathways Consulting</p>
          <p className="mt-2">APC Calm Companion provides educational support tools only. It is not medical advice, diagnosis, therapy, or crisis intervention.</p>
          <p className="mt-2">For professional support, visit <a href="https://autismpathwaysconsulting.com" target="_blank" rel="noreferrer" className="font-bold text-teal-700 underline">autismpathwaysconsulting.com</a>.</p>
        </footer>
      </div>
    </main>
  );
}
