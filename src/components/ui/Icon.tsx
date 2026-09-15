const PATHS = {
  home: ["M3 10.5 12 3l9 7.5", "M5.25 9.75V21h13.5V9.75", "M9.75 21v-6h4.5v6"],
  income: ["M2.5 6.5h19v11h-19z", "M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z", "M6 8.5h.01", "M18 15.5h.01"],
  expense: ["M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z", "M8.5 8h7", "M8.5 12h7", "M8.5 16h4"],
  wallet: [
    "M3 7.5A2.5 2.5 0 0 1 5.5 5h12A2.5 2.5 0 0 1 20 7.5V9h-4a3 3 0 0 0 0 6h4v1.5A2.5 2.5 0 0 1 17.5 19h-12A2.5 2.5 0 0 1 3 16.5v-9Z",
    "M16 12h.01",
  ],
  history: ["M3 12a9 9 0 1 0 3-6.7", "M3 4v4h4", "M12 7.5v4.5l3 2"],
  budget: ["M5 20V11", "M11 20V6", "M17 20v-9", "M3 20h18"],
  goal: [
    "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z",
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    "M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  ],
  users: [
    "M17 20c0-2.8-2.2-5-5-5H8c-2.8 0-5 2.2-5 5",
    "M10 15a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M15.5 4a3.5 3.5 0 0 1 0 6.8",
    "M21 20c0-2.2-1.4-4.1-3.4-4.8",
  ],
  settings: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M12 2v3",
    "M12 19v3",
    "M4.2 4.2l2.1 2.1",
    "M17.7 17.7l2.1 2.1",
    "M2 12h3",
    "M19 12h3",
    "M4.2 19.8l2.1-2.1",
    "M17.7 6.3l2.1-2.1",
  ],
  menu: ["M3.5 6.5h17", "M3.5 12h17", "M3.5 17.5h17"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  refresh: ["M4 4v5h5", "M20 20v-5h-5", "M4.6 9a8 8 0 0 1 14-3.3L20 9", "M19.4 15a8 8 0 0 1-14 3.3L4 15"],
  trendingDown: ["M4 6l6 6 4-4 6 8", "M20 12v4h-4"],
  scale: [
    "M12 3v18",
    "M8 21h8",
    "M5 7h5",
    "M14 7h5",
    "M5 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L5 7Z",
    "M19 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L19 7Z",
  ],
  piggyBank: [
    "M4 13a7 5.5 0 0 1 7-5.5c3 0 5.5 1.3 6.8 3.3L20 10v4l-3 .7c-.5 2.4-2.8 4.1-6 4.1h-2L8 21H6l1-3.4C5.2 16.7 4 15 4 13Z",
    "M15.5 11.5h.01",
    "M8.5 9 7.5 6.5",
    "M13.5 9l.5-2.5",
  ],
  percent: ["M18 6 6 18", "M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  chevronLeft: ["M15 5l-7 7 7 7"],
  chevronRight: ["M9 5l7 7-7 7"],
  warning: ["M12 3.5 21.5 20h-19L12 3.5Z", "M12 9.5v4.5", "M12 17h.01"],
  check: ["M4.5 12.5 9.5 17.5 19.5 6.5"],
  lock: ["M5 10.5h14v10H5z", "M8 10.5V7.5a4 4 0 0 1 8 0v3"],
  heart: ["M12 20.5S3.5 15.2 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 6-8.5 11.3-8.5 11.3Z"],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "h-5 w-5",
  ...rest
}: { name: IconName } & React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
