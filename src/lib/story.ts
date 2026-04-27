export const emotions = [
  "tense",
  "joyful",
  "melancholic",
  "dramatic",
  "peaceful",
  "mysterious",
  "action",
  "romantic",
] as const;

export const panelStyles = ["wide", "portrait", "square", "panoramic"] as const;

export type Emotion = (typeof emotions)[number];
export type PanelStyle = (typeof panelStyles)[number];

export type Scene = {
  id: string;
  sceneNumber: number;
  title: string;
  narratorText: string;
  keyMoment: string;
  visualPrompt: string;
  characters: string[];
  setting: string;
  emotion: Emotion;
  panelStyle: PanelStyle;
  imageBase64?: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type Reel = {
  id: string;
  title: string;
  totalScenes: number;
  genre: string;
  mood: string;
  style: string;
  narrationEnabled: boolean;
  scenes: Scene[];
  createdAt: string;
  isDemo?: boolean;
};

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const demoImage = (primary: string, secondary: string, foreground: string) =>
  svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
    <defs>
      <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="${primary}" offset="0"/>
        <stop stop-color="${secondary}" offset="1"/>
      </linearGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="3"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 .14"/></feComponentTransfer>
      </filter>
    </defs>
    <rect width="1600" height="1000" fill="url(#sky)"/>
    <rect width="1600" height="1000" filter="url(#grain)" opacity=".5"/>
    <path d="M0 730 C240 650 360 760 560 700 C760 640 910 700 1110 620 C1290 550 1440 610 1600 535 L1600 1000 L0 1000 Z" fill="${foreground}" opacity=".78"/>
    <path d="M235 325 h245 l55 420 H180 Z" fill="#101010" opacity=".78"/>
    <path d="M980 255 h285 l68 490 H910 Z" fill="#111" opacity=".7"/>
    <circle cx="705" cy="310" r="62" fill="#e8c547" opacity=".82"/>
  </svg>`);

export const demoReel: Reel = {
  id: "demo",
  title: "A Study in Scarlet: First Impressions",
  totalScenes: 4,
  genre: "Victorian mystery",
  mood: "Fog-bound and observant",
  style: "Graphic Novel",
  narrationEnabled: false,
  createdAt: "1887-11-01T00:00:00.000Z",
  isDemo: true,
  scenes: [
    {
      id: "demo-1",
      sceneNumber: 1,
      title: "The Wounded Doctor",
      narratorText:
        "Dr. Watson returns from war with a restless mind, drifting through London in search of a room and a new beginning.",
      keyMoment: "Watson arrives in London after Afghanistan.",
      visualPrompt:
        "A Victorian army doctor alone in a smoky London street, cinematic mystery lighting",
      characters: ["Dr. Watson"],
      setting: "A foggy London thoroughfare",
      emotion: "melancholic",
      panelStyle: "wide",
      imageUrl: demoImage("#28221d", "#6f5b40", "#171410"),
    },
    {
      id: "demo-2",
      sceneNumber: 2,
      title: "A Strange Introduction",
      narratorText:
        "An old acquaintance mentions a brilliant, peculiar man who needs a flatmate at 221B Baker Street.",
      keyMoment: "Stamford proposes Sherlock Holmes as a roommate.",
      visualPrompt:
        "Two Victorian gentlemen speaking in a hospital courtyard, intrigue and warm lamplight",
      characters: ["Dr. Watson", "Stamford"],
      setting: "St. Bartholomew's Hospital",
      emotion: "mysterious",
      panelStyle: "portrait",
      imageUrl: demoImage("#1d2c32", "#4e6065", "#11191b"),
    },
    {
      id: "demo-3",
      sceneNumber: 3,
      title: "The Laboratory Spark",
      narratorText:
        "Holmes bursts with delight over a chemical test, revealing a mind tuned to clues invisible to everyone else.",
      keyMoment: "Holmes demonstrates his blood test.",
      visualPrompt:
        "Sherlock Holmes in a Victorian laboratory holding a test tube, golden chemical glow",
      characters: ["Sherlock Holmes", "Dr. Watson"],
      setting: "A cluttered hospital laboratory",
      emotion: "joyful",
      panelStyle: "square",
      imageUrl: demoImage("#27272a", "#61511f", "#131313"),
    },
    {
      id: "demo-4",
      sceneNumber: 4,
      title: "221B Awaits",
      narratorText:
        "The rooms are taken, the partnership begins, and London quietly prepares to reveal its darkest puzzles.",
      keyMoment: "Watson and Holmes agree to share Baker Street rooms.",
      visualPrompt:
        "221B Baker Street exterior at night, gas lamps, London fog, cinematic detective mood",
      characters: ["Sherlock Holmes", "Dr. Watson"],
      setting: "Baker Street at night",
      emotion: "dramatic",
      panelStyle: "panoramic",
      imageUrl: demoImage("#111827", "#3f2f1f", "#090b0f"),
    },
  ],
};

export const createFallbackImage = () => demoImage("#111111", "#332b1c", "#070707");

export const estimateImageCost = (count: number) => (count * 0.08).toFixed(2);
