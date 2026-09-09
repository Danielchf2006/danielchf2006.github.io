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
} as const;

export type SocialLink = {
  label: string;
  href: string;
  // short text glyph used until real icons are dropped in
  glyph: string;
};

export const socials: SocialLink[] = [
  { label: "Email", href: `mailto:danielcai2029@u.northwestern.edu`, glyph: "@" },
  { label: "GitHub", href: "https://github.com/Danielchf2006", glyph: "GH" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/", glyph: "in" },
];

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "About", href: "/" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
];
