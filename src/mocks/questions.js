// 48 RIASEC questions: 6 dimensions x 8 items.
// Built from 8 prompts per dimension so that every "step" (page) shows
// exactly one question from each of the 6 dimensions.

const PROMPTS = {
  R: [
    "Repair a bike or a piece of furniture",
    "Assemble electronic components from a diagram",
    "Work outdoors with tools and machines",
    "Build a small wooden shelf from scratch",
    "Install and test hardware in a lab",
    "Operate equipment on a construction site",
    "Take apart a device to see how it works",
    "Do physical, hands-on work every day",
  ],
  I: [
    "Investigate why an experiment failed",
    "Read about new scientific discoveries",
    "Analyse a large dataset to find patterns",
    "Solve difficult logic or maths puzzles",
    "Design a study to test an idea",
    "Study how diseases spread in a population",
    "Debug a complex problem step by step",
    "Spend hours researching a single question",
  ],
  A: [
    "Design a poster for a college event",
    "Write a short story or poem",
    "Compose or perform music",
    "Sketch characters for a game",
    "Edit a short film",
    "Invent new visual styles for a brand",
    "Decorate a space in an unusual way",
    "Work on projects with no fixed rules",
  ],
  S: [
    "Tutor a classmate who is struggling",
    "Volunteer at a community health camp",
    "Listen to someone talk through a problem",
    "Teach a skill to a group of beginners",
    "Help new students settle into campus",
    "Mediate a disagreement between friends",
    "Care for people who need support",
    "Work in a team that helps others daily",
  ],
  E: [
    "Pitch an idea to a room full of people",
    "Start a small business with friends",
    "Lead a team towards a deadline",
    "Negotiate a better deal for your club",
    "Sell a product you believe in",
    "Organise and host a large event",
    "Convince others to back your plan",
    "Take charge when nobody else will",
  ],
  C: [
    "Keep detailed records organised and accurate",
    "Follow a clear checklist to finish a task",
    "Check documents for small errors",
    "Manage a budget in a spreadsheet",
    "Set up a filing system for a team",
    "Schedule and track many small deadlines",
    "Work with clear rules and procedures",
    "Double-check numbers until they balance",
  ],
};

export const DIMENSIONS = ["R", "I", "A", "S", "E", "C"];

export const DIMENSION_LABELS = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Dislike" },
  { value: 2, label: "Dislike" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Like" },
  { value: 5, label: "Strongly Like" },
];

export const TOTAL_STEPS = 8;

// step 1..8, one question per dimension per step -> 48 questions total
export const questions = Array.from({ length: TOTAL_STEPS }, (_, stepIndex) =>
  DIMENSIONS.map((dimension) => ({
    id: `${dimension}${stepIndex + 1}`,
    dimension,
    prompt: PROMPTS[dimension][stepIndex],
    step: stepIndex + 1,
  })),
).flat();

export default questions;
