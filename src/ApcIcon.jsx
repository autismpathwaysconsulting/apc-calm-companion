const paths = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-6h5v6" /></>,
  calm: <><circle cx="12" cy="12" r="8" /><path d="M12 7v10M7 12h10" /><path d="M8.6 8.6 15.4 15.4M15.4 8.6 8.6 15.4" /></>,
  routine: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="m8 9 1.5 1.5L12 8M14.5 9H17M8 15l1.5 1.5L12 14M14.5 15H17" /></>,
  communication: <><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></>,
  tools: <><path d="M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><path d="M9 8V5h6v3M3 13h18M10 13v2h4v-2" /></>,
  feedback: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  install: <><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M12 6v8m-3-3 3 3 3-3M10 18h4" /></>,
  bedtime: <><path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /><path d="m17 4 .4 1.1 1.1.4-1.1.4L17 7l-.4-1.1-1.1-.4 1.1-.4Z" /></>,
  date: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></>,
  alert: <><path d="M12 3 2.8 19h18.4Z" /><path d="M12 9v4M12 16h.01" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5M9 3h6" /></>,
  sequence: <><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="5" width="7" height="14" rx="2" /><path d="m10 12 4 0m-2-2 2 2-2 2" /></>,
  reward: <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 5.9-5.4-2.8-5.4 2.8 1-5.9-4.3-4.2 6-.9Z" />,
  guide: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23Z" /></>,
  family: <><circle cx="8" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0M12.5 20a4 4 0 0 1 8 0" /></>,
  brain: <><path d="M9.5 4a3 3 0 0 0-5 2.2A3 3 0 0 0 3 11a3 3 0 0 0 2 5.7A3 3 0 0 0 10.5 19V5.5A2.5 2.5 0 0 0 9.5 4Z" /><path d="M14.5 4a3 3 0 0 1 5 2.2A3 3 0 0 1 21 11a3 3 0 0 1-2 5.7A3 3 0 0 1 13.5 19V5.5A2.5 2.5 0 0 1 14.5 4ZM8 9H5.5M16 9h2.5M8 14H5.5M16 14h2.5" /></>,
  spark: <><path d="m12 3 .8 3.2L16 7l-3.2.8L12 11l-.8-3.2L8 7l3.2-.8Z" /><path d="m6 13 .6 2.4L9 16l-2.4.6L6 19l-.6-2.4L3 16l2.4-.6Z" /><path d="m18 13 .6 2.4L21 16l-2.4.6L18 19l-.6-2.4L15 16l2.4-.6Z" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  sensory: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v5a2 2 0 0 0 2 2h2v-8H4ZM20 13v5a2 2 0 0 1-2 2h-2v-8h4Z" /></>,
  volume: <><path d="M5 9H2v6h3l5 4V5Z" /><path d="M14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12" /></>,
};

export default function ApcIcon({ name, className = "", title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`apc-icon ${className}`}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name] || paths.info}
    </svg>
  );
}
