import type { Achievement, Course, TimelineEntry } from "@/types"

/**
 * ---------------------------------------------------------------------------
 * SOURCES, in order of authority.
 * ---------------------------------------------------------------------------
 *  1. The CV PDF in the repository root. Newest document, and the only one that
 *     carries the emergence AI role, the Saturn Labs FPS figure, the mess
 *     committee seat and the Class 10 percentage. It wins every disagreement.
 *  2. linkdin.md, the LinkedIn export. Still authoritative for the 2024 to 2028
 *     programme span and the Vicharaka promotion date, neither of which the CV
 *     records.
 *  3. website/my-website, the previous site, for the board percentages and exam
 *     ranks that neither of the above carries.
 *
 * Two corrections the CV forced on the previous version of this file:
 *  - Saturn Labs was described here as "simulation and telemetry infrastructure"
 *    with a vague pipeline claim. It was Isaac Sim / Isaac Lab / Gazebo work on
 *    3D hand pose detection, and it has a real number attached.
 *  - emergence AI was missing entirely.
 *
 * The CV separates INTERNSHIPS from POSITION OF RESPONSIBILITY. This file keeps
 * that separation rather than merging both into one "experience" list, because
 * a reader scanning for paid engineering work should not have to filter a
 * festival PR role out of it.
 */

/* ---------------------------------------------------------------------------
   Internships
--------------------------------------------------------------------------- */

export const experience: TimelineEntry[] = [
  {
    id: "emergence-ai",
    kind: "experience",
    period: "May 2026 to Jul 2026",
    start: "2026-05-01",
    title: "Research Intern",
    organization: "emergence AI",
    summary:
      "Formal verification applied to a physics engine, so that reinforcement learning agents cannot farm rewards out of the simulator's own numerical mistakes.",
    highlights: [
      "Built a 2D collision detection engine in Lean 4 with correctness proofs carried alongside the implementation, structurally eliminating the tunnelling exploit where a fast body passes through a wall between two timesteps.",
      "Replaced IEEE-754 floating point with exact rational arithmetic, making the state machine fully deterministic: identical inputs produce bit-identical output on any machine, so a training run is reproducible and a replay is trustworthy.",
      "Tunnelling matters because an RL agent will find it. Any gap between the physics you intended and the physics you shipped becomes a reward the agent learns to collect instead of the task.",
    ],
    skills: [
      "Lean 4",
      "Formal Verification",
      "Theorem Proving",
      "Rational Arithmetic",
      "Physics Simulation",
    ],
  },
  {
    id: "saturn-labs",
    kind: "experience",
    period: "Dec 2025 to Mar 2026",
    start: "2025-12-01",
    title: "Robotics Engineering Intern",
    organization: "Saturn Labs",
    location: "Bengaluru",
    summary:
      "Synthetic data and simulation for egocentric vision: generating the training set in NVIDIA Isaac Sim, then making the model that consumed it fast enough to run live.",
    highlights: [
      "Built synthetic data pipelines and physics-based simulation environments in NVIDIA Isaac Sim, Isaac Lab and Gazebo.",
      "Took the real-time 3D hand pose pipeline from 50 FPS to 85 to 90 FPS on the same hardware, roughly a 75 percent increase, by reworking the data path and the network architecture together rather than tuning either alone.",
      "Latency is the whole product in egocentric vision. A hand tracker running at 50 FPS on a headset is one the wearer can feel lagging behind their own hand.",
    ],
    skills: [
      "Isaac Sim",
      "Isaac Lab",
      "Gazebo",
      "Synthetic Data",
      "PyTorch",
      "Real-time Inference",
    ],
  },
]

/* ---------------------------------------------------------------------------
   Positions of responsibility
--------------------------------------------------------------------------- */

export const leadership: TimelineEntry[] = [
  {
    id: "vicharaka",
    kind: "leadership",
    period: "Feb 2025 to Present",
    start: "2025-02-01",
    title: "Core Technical Coordinator",
    // Short, because this string is also the label on every skill that cites
    // this role as evidence. "Vicharaka, the IISc UG robotics club" wraps to
    // two lines there and buries the skill it is meant to support.
    organization: "Vicharaka, IISc",
    location: "Bengaluru",
    current: true,
    summary:
      "IISc's undergraduate robotics team, building a competition-standard Mars rover. I sit where the mechanical design meets the simulation and data work.",
    highlights: [
      "Direct a cross-functional team across mechanical subsystem design, simulation testing and the data processing pipelines that connect them.",
      "Own chassis geometry, suspension travel and mechanical mounts for the rover platform.",
      "Manage technical budgets and the sponsorship relationships with ARTPARK IISc and Ansys that fund them.",
      "Promoted from Member of Technical Staff in April 2025.",
    ],
    skills: [
      "SolidWorks",
      "Fusion 360",
      "ROS2",
      "Mechanical Design",
      "Simulation",
    ],
  },
  {
    id: "pravega",
    kind: "leadership",
    period: "Sep 2024 to Present",
    start: "2024-09-01",
    title: "Public Relations Coordinator",
    organization: "Pravega, IISc",
    location: "Bengaluru",
    current: true,
    summary:
      "IISc's flagship science and culture festival. Two years on the organising side, the second running national communications.",
    highlights: [
      "Lead the national communications strategy for the festival, from July 2025.",
      "Streamlined multi-team execution by moving repetitive coordination onto automated workflows.",
      "Planned and ran events end to end as an Event Executive from September 2024.",
    ],
    skills: ["Communications", "Team Leadership", "Event Operations"],
  },
  {
    id: "mess-committee",
    kind: "leadership",
    period: "2025",
    start: "2025-08-01",
    title: "Elected Member",
    organization: "IISc Mess Committee",
    location: "Bengaluru",
    summary:
      "Elected by the student body to oversee catering operations at institute scale, which turns out to be a supply-chain problem wearing a dining hall.",
    highlights: [
      "Managed large-scale vendor operations on behalf of the residents they serve.",
      "Applied analytical evaluation and resource optimisation to drive cost efficiency.",
      "Represented student feedback in operational decisions affecting several thousand meals a day.",
    ],
    skills: ["Vendor Management", "Resource Optimisation", "Negotiation"],
  },
]

/* ---------------------------------------------------------------------------
   Education
--------------------------------------------------------------------------- */

export const education: TimelineEntry[] = [
  {
    id: "iisc",
    kind: "education",
    period: "2024 to 2028",
    start: "2024-08-01",
    title: "B.Tech, Mathematics and Computing",
    organization: "Indian Institute of Science, Bengaluru",
    location: "Bengaluru",
    current: true,
    summary:
      "IISc's flagship undergraduate engineering programme, entered through JEE Advanced. Currently in third year.",
    highlights: [
      "One of roughly 60 students admitted to the programme each year.",
      "Entered on JEE Advanced 2024 with All India Rank 2823.",
      "Coursework across pure mathematics, theory of computation, numerical methods and machine learning.",
      "Research access to IISc faculty and facilities alongside the degree.",
    ],
    skills: [
      "Mathematics",
      "Theory of Computation",
      "Numerical Methods",
      "Machine Learning",
      "Statistics",
    ],
  },
  {
    id: "class-12",
    kind: "education",
    period: "2024",
    start: "2024-03-01",
    title: "Class 12, CBSE",
    organization: "Narayana High School, Chinagadili",
    location: "Visakhapatnam",
    summary:
      "95 percent aggregate in the science stream, alongside two years of JEE Advanced preparation.",
    highlights: [
      "Informatics Practices 97 percent, the highest subject score.",
      "English 96, Physics 95, Chemistry 95, Mathematics 92.",
      "Concurrent preparation for JEE Advanced, JEE Main and the SAT.",
    ],
    skills: ["Mathematics", "Physics", "Chemistry", "Informatics Practices"],
  },
  {
    id: "class-10",
    kind: "education",
    period: "2022",
    start: "2022-03-01",
    title: "Class 10, CBSE",
    organization: "Narayana High School, Chinagadili",
    location: "Visakhapatnam",
    summary:
      "92.6 percent. Where the mathematics and the programming both started.",
    highlights: [
      "Built the foundation in mathematics and the sciences the later work rests on.",
      "First exposure to programming and computer science.",
      "Regular participation in school-level academic competitions.",
    ],
    skills: ["Mathematics", "Science", "Programming Fundamentals"],
  },
]

/* ---------------------------------------------------------------------------
   Results and coursework
--------------------------------------------------------------------------- */

/**
 * `label` deliberately does NOT repeat the year: the Results panel renders
 * `label` and `year` next to each other, so "JEE Advanced 2024" plus the year
 * column came out as "JEE Advanced 2024 2024".
 */
export const achievements: Achievement[] = [
  {
    id: "jee-advanced",
    value: "AIR 2,823",
    label: "JEE Advanced",
    detail:
      "All India Rank in the entrance examination for the IITs and IISc, from a field of roughly 180,000 qualified candidates.",
    year: "2024",
  },
  {
    id: "jee-main",
    value: "99%ile",
    label: "JEE Main",
    detail:
      "Top 0.8 percent of approximately one million candidates in India's largest engineering entrance examination.",
    year: "2024",
  },
  {
    id: "sat",
    value: "1510",
    label: "SAT",
    detail: "Out of a maximum of 1600.",
    year: "2024",
  },
  {
    id: "cbse-12",
    value: "95%",
    label: "Class 12 CBSE, aggregate",
    detail:
      "Highest subject score in Informatics Practices at 97 percent, with 95 percent in both Physics and Chemistry.",
    year: "2024",
  },
  {
    id: "cbse-10",
    value: "92.6%",
    label: "Class 10 CBSE, aggregate",
    detail: "Across the full board examination at Narayana High School.",
    year: "2022",
  },
]

/** Undergraduate coursework, from the CV. Grouped for the education panel. */
export const courses: Course[] = [
  { name: "Linear Algebra", area: "Mathematics" },
  { name: "Probability and Statistics", area: "Mathematics" },
  { name: "Numerical Methods", area: "Mathematics" },
  { name: "Automata Theory", area: "Computing" },
  { name: "Introduction to AI and ML", area: "Machine Learning" },
]

/** From the CV. Rendered on the contact page, where it is actually useful. */
export const languages = ["English", "Hindi", "Telugu"] as const

/* ---------------------------------------------------------------------------
   Derived
--------------------------------------------------------------------------- */

/** Everything currently running. The home page reads this. */
export const currentRoles: TimelineEntry[] = [...experience, ...leadership]
  .filter((entry) => entry.current)
  .sort((a, b) => b.start.localeCompare(a.start))

/** Most recent first. Used wherever a single combined history is wanted. */
export const timeline: TimelineEntry[] = [
  ...experience,
  ...leadership,
  ...education,
].sort((a, b) => b.start.localeCompare(a.start))
