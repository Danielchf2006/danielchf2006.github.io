export type Education = {
  school: string;
  degree: string;
  location: string;
  dates: string;
  details: string[];
};

export const education: Education[] = [
  {
    school: "Northwestern University",
    degree: "B.A. in Data Science & Economics",
    location: "Evanston, IL",
    dates: "Expected June 2028",
    details: [
      "GPA 3.6 / 4.00 · SAT 1550 / 1600",
      "Coursework: Advanced Micro/Macroeconomics, Advanced Linear Algebra & Multivariable Calculus, Data Structures & Visualization, Python for Machine Learning, Pandas, Statistics & Probability, AI in the Modern Workspace",
    ],
  },
];
