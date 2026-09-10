/**
 * Site-wide identity and configuration.
 * Edit this file to change the name, tagline, and social links everywhere.
 */

export const site = {
  name: "Daniel Cai",
  fullName: "Daniel (Haofan) Cai",
  role: "Data Science & Economics @ Northwestern",
  // one or two sentences, shown on the homepage under the name
  tagline:
    "I build models and pipelines that turn messy real-world data — energy queues, housing listings, legal contracts — into decisions people can act on.",
  url: "https://danielchf2006.github.io",
  email: "danielcai2029@u.northwestern.edu",
  location: "Evanston, IL",
  // dropped into /public/resume/ — see that folder's README
  resumePath: "/resume/Daniel-Cai-Resume.pdf",
  // portrait shown in the homepage hero. Drop a file in /public/images/profile/
  // and point here (e.g. "/images/profile/daniel.jpg"); leave "" for a
  // placeholder tile. Either way it's cursor-touchable like the rest of the page.
  portrait: "",
  // full-screen entry animation. Drop a file in /public/intro/ and point `src`
  // at it — .gif / .webp / .apng, or .mp4 / .webm (much smaller than a GIF).
  // Leave src "" to use the built-in animated placeholder.
  intro: {
    enabled: true,
    src: "",
    // how long the overlay holds before it dissolves (ms). Match your clip.
    durationMs: 2600,
    // true: plays once per browser session. false: every page load.
    showOncePerSession: true,
    // crisp-scale the media instead of smoothing it (for pixel-art clips)
    pixelated: true,
  },
} as const;

export type SocialLink = {
  label: string;
  href: string;
  // pixel icon name — see src/components/PixelIcon.astro
  icon: "mail" | "github" | "linkedin";
};

export const socials: SocialLink[] = [
  { label: "Email", href: `mailto:danielcai2029@u.northwestern.edu`, icon: "mail" },
  { label: "GitHub", href: "https://github.com/Danielchf2006", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-cai-5b0706261/", icon: "linkedin" },
];

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "About", href: "/" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
];
