const GUIDE_IDS = new Set(["less-language", "next-step", "respond", "situation", "parent-pause"]);
const TOOL_IDS = new Set(["first-then", "choices", "timer", "communication", "observation"]);
const MORE_SECTION_IDS = new Set(["profile", "safety", "feedback", "privacy", "evidence", "install"]);

export function parseAppHash(hash = "") {
  const [view = "actions", detail = ""] = String(hash).replace(/^#\/?/, "").split("/");
  if (view === "actions") {
    const guideId = GUIDE_IDS.has(detail) ? detail : "";
    return { view: "actions", guideId, toolId: "", moreSection: "safety" };
  }
  if (view === "tools") {
    const toolId = TOOL_IDS.has(detail) ? detail : "";
    return { view: "tools", guideId: "", toolId, moreSection: "safety" };
  }
  if (view === "more") {
    const moreSection = MORE_SECTION_IDS.has(detail) ? detail : "safety";
    return { view: "about", guideId: "", toolId: "", moreSection };
  }
  return { view: "actions", guideId: "", toolId: "", moreSection: "safety" };
}

export function appHash({ view, guideId = "", toolId = "", moreSection = "safety" }) {
  if (view === "tools") return toolId ? `#tools/${toolId}` : "#tools";
  if (view === "about") return `#more/${MORE_SECTION_IDS.has(moreSection) ? moreSection : "safety"}`;
  return guideId && GUIDE_IDS.has(guideId) ? `#actions/${guideId}` : "#actions";
}
