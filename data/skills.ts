import type { Skill, SkillBand, SkillCategory } from "@/types"

/**
 * ---------------------------------------------------------------------------
 * STRUCTURE
 * ---------------------------------------------------------------------------
 * The four categories below mirror the CV's own SKILLS section (Systems
 * Engineering, Machine Learning, Robotics and Physical Simulation) plus the
 * mathematics the degree is actually in. Keeping the site's taxonomy identical
 * to the CV's means a reader holding both documents never has to reconcile two
 * different stories about the same person.
 *
 * ---------------------------------------------------------------------------
 * A NOTE ON THE NUMBERS - read before editing.
 * ---------------------------------------------------------------------------
 * `level` is a self-assessment, not a measurement. Three provenances:
 *
 *  - Carried over verbatim from the previous site, which Mohnish wrote himself:
 *    Python, C++, Linear Algebra, Calculus, Probability and Statistics,
 *    Optimisation, Group Theory, CAD modelling.
 *  - Seeded from demonstrated work in .research/FINDINGS.md for everything the
 *    old page predates. The 2026 repositories show far more depth in deep
 *    learning, retrieval and compression than the old numbers admitted.
 *  - Added from the CV: Lean 4, Isaac Sim, Isaac Lab, Gazebo, Blender, FastAPI,
 *    Networking, LaTeX and the model families under Machine Learning.
 *
 * The UI prints a *band*, never the integer, precisely so nobody has to defend
 * the difference between 78 and 82. Tune freely; `bandFor()` below is the only
 * thing that reads the value besides the bar width and the sort.
 *
 * `evidence` links a skill to project ids, `roles` to timeline entry ids. A
 * skill with neither is fine; it just renders without the evidence row.
 */

const BANDS: { min: number; band: SkillBand }[] = [
  { min: 90, band: "Core" },
  { min: 75, band: "Advanced" },
  { min: 55, band: "Proficient" },
  { min: 35, band: "Working" },
  { min: 0, band: "Learning" },
]

/** Anything flagged `learning` bands as Learning regardless of level. */
export function bandFor(skill: Skill): SkillBand {
  if (skill.learning) return "Learning"
  return BANDS.find((b) => skill.level >= b.min)!.band
}

/**
 * Band to token. Five steps of one hue, all clearing AA against both
 * `--background` values. The previous site used eleven colours and read as a
 * paint chart.
 */
export const bandStyles: Record<SkillBand, { text: string; dot: string }> = {
  Core: { text: "text-primary", dot: "bg-primary" },
  Advanced: { text: "text-primary/80", dot: "bg-primary/80" },
  Proficient: { text: "text-foreground/70", dot: "bg-foreground/50" },
  Working: { text: "text-muted-foreground", dot: "bg-muted-foreground/60" },
  Learning: { text: "text-muted-foreground/80", dot: "bg-border" },
}

export const skillCategories: SkillCategory[] = [
  {
    id: "ml",
    title: "Machine Learning",
    summary:
      "Where most of the last two years went. Retrieval, transformers, and making models small enough to run on hardware I actually own.",
    accent: "var(--primary)",
    skills: [
      {
        name: "PyTorch",
        level: 85,
        description:
          "Custom modules and training loops, AMP autocast, gradient checkpointing, scaled-dot-product Flash Attention, and profiling for VRAM rather than for FLOPs.",
        evidence: ["image-to-latex", "vit-compression"],
        roles: ["saturn-labs"],
      },
      {
        name: "Retrieval and RAG",
        level: 85,
        description:
          "Hybrid lexical and dense retrieval, reciprocal rank fusion, contextual chunk embedding, per-tenant collection isolation. Two production-shaped services built end to end.",
        evidence: ["legal-rag", "kurt"],
      },
      {
        name: "Vision Transformers",
        level: 82,
        description:
          "Standard ViTs, EfficientViT and DPT-Hybrid. Attention internals to the point of surgery: token merging by key-cosine similarity, proportional rescaling, entropy-ranked head pruning.",
        evidence: ["vit-compression", "image-to-latex"],
      },
      {
        name: "Model Compression",
        level: 80,
        description:
          "INT8 AbsMax and NF4 quantisation through bitsandbytes, token merging, L2 threshold masking and structural head pruning, mapped against a measured Pareto frontier.",
        evidence: ["vit-compression"],
      },
      {
        name: "Deep Learning Architecture",
        level: 80,
        description:
          "Encoder-decoder design, 2D positional encoding, autoregressive decoding, ResNet-18 backbones, and mixed-precision training inside an 8 GB budget.",
        evidence: ["image-to-latex", "vit-compression"],
        roles: ["saturn-labs"],
      },
      {
        name: "LangChain and Hugging Face",
        level: 75,
        description:
          "Document loaders, splitters and embedding pipelines; sentence-transformers for retrieval and the Datasets library for corpus assembly.",
        evidence: ["kurt", "image-to-latex"],
      },
      {
        name: "LLM Integration",
        level: 75,
        description:
          "Llama-3 and Mistral served locally through Ollama, with hot-swap across five providers including Gemini Vision, driven by a provider descriptor rather than by branching.",
        evidence: ["kurt"],
      },
      {
        name: "Computer Vision",
        level: 75,
        description:
          "Hybrid conv-transformer backbones, 2D layout preservation for mathematical notation, and real-time hand landmark tracking with temporal filtering.",
        evidence: ["vit-compression", "image-to-latex", "hand-gesture-drawing"],
        roles: ["saturn-labs"],
      },
      {
        name: "Speech and Audio",
        level: 60,
        description:
          "Whisper-family ASR through Faster-Whisper with voice activity detection, CUDA-accelerated well past real time.",
        evidence: ["kurt"],
      },
      {
        name: "Reinforcement Learning",
        level: 30,
        learning: true,
        description:
          "Q-learning, policy gradients and deep Q-networks. The emergence AI work was about the simulator RL agents exploit rather than about the agents themselves.",
        roles: ["emergence-ai"],
      },
    ],
  },
  {
    id: "systems",
    title: "Systems Engineering",
    summary:
      "The unglamorous half of a working project: services, queues, stores, isolation boundaries and tests.",
    accent: "var(--primary)",
    skills: [
      {
        name: "Python",
        level: 95,
        description:
          "Scientific computing, async services, and the whole numerical stack. The language every project here is written in.",
        evidence: ["legal-rag", "kurt", "f1-telemetry", "image-to-latex"],
      },
      {
        name: "FastAPI",
        level: 78,
        description:
          "Async API design, dependency-injected session scoping, and fail-closed tenancy enforcement at the router boundary.",
        evidence: ["legal-rag"],
      },
      {
        name: "Git and Linux",
        level: 75,
        description:
          "Day-to-day version control and branch hygiene on a Linux workstation, plus static deployment through GitHub Pages. CI matrices, tagged releases and GitHub Pages deploys through GitHub Actions.",
        evidence: ["f1-telemetry", "wackystuff"],
      },
      {
        name: "Testing",
        level: 72,
        description:
          "210 unit tests in roughly six seconds with no external dependencies on the legal assistant, and 905 offline tests on the F1 dashboard, gated in CI across Python 3.11 to 3.14 on Ubuntu and Windows with a 75 percent coverage floor.",
        evidence: ["legal-rag", "f1-telemetry"],
      },
      {
        name: "Vector Databases",
        level: 72,
        description:
          "ChromaDB collection design, per-course and per-session partitioning, and metadata filtering with centroid steering.",
        evidence: ["legal-rag", "kurt"],
      },
      {
        name: "Celery and Redis",
        level: 68,
        description:
          "Background ingestion pipelines, solo-pool workers where VRAM forbids concurrency, and subprocess isolation for irreconcilable dependency pins.",
        evidence: ["legal-rag"],
      },
      {
        name: "Networking",
        level: 65,
        description:
          "WebSocket and SignalR protocol work down to the payload: a hand-written SignalR Core client with reconnect and backoff, decoding compressed live timing frames, and tunnelling a self-hosted API to a static front end.",
        evidence: ["f1-telemetry", "legal-rag"],
      },
      {
        name: "LaTeX",
        level: 65,
        description:
          "Typesetting as a build target rather than a document format: Tectonic compilation, matplotlib mathtext as an offline renderer, and a 1,007-token LaTeX vocabulary as a model output space.",
        evidence: ["kurt", "image-to-latex"],
      },
      {
        name: "C++",
        level: 55,
        description:
          "Performance-critical routines and algorithm implementation. Comfortable, not fluent.",
      },
      {
        name: "TypeScript",
        level: 55,
        description:
          "React SPAs and typed component work. The legal assistant's front end, and this site.",
        evidence: ["legal-rag"],
      },
      {
        name: "SQL",
        level: 48,
        description:
          "Schema design and query work against SQLite in WAL mode, for document and job state and for a persistent records store.",
        evidence: ["legal-rag", "f1-telemetry"],
      },
    ],
  },
  {
    id: "robotics",
    title: "Robotics and Simulation",
    summary:
      "Synthetic worlds and the physical ones they stand in for, from a rover chassis to an egocentric hand tracker.",
    accent: "var(--primary)",
    skills: [
      {
        name: "SolidWorks",
        level: 78,
        description:
          "3D modelling, assemblies and technical drawings for the Mars rover chassis, suspension geometry and mechanical mounts.",
        roles: ["vicharaka"],
      },
      {
        name: "NVIDIA Isaac Sim",
        level: 75,
        description:
          "Physics-based simulation environments and synthetic data generation for perception training, built during the Saturn Labs internship.",
        roles: ["saturn-labs"],
      },
      {
        name: "Isaac Lab",
        level: 70,
        description:
          "Environment and task construction on top of Isaac Sim, generating labelled data at a volume real capture could not reach.",
        roles: ["saturn-labs"],
      },
      {
        name: "Simulation-to-Reality Alignment",
        level: 68,
        description:
          "Closing the gap between a model trained on synthetic frames and one that has to work on a real camera, which is where most synthetic data pipelines quietly fail.",
        roles: ["saturn-labs"],
      },
      {
        name: "Gazebo",
        level: 65,
        description:
          "Robot simulation and sensor modelling alongside the Isaac stack.",
        roles: ["saturn-labs"],
      },
      {
        name: "Fusion 360",
        level: 65,
        description:
          "Parametric modelling and design iteration alongside SolidWorks on rover subsystems.",
        roles: ["vicharaka"],
      },
      {
        name: "Robot Assembly and Testing",
        level: 62,
        description:
          "Physical integration: taking a subsystem from a machinable drawing to a mounted, wired part that survives contact with terrain.",
        roles: ["vicharaka"],
      },
      {
        name: "Blender",
        level: 55,
        description:
          "Asset preparation and scene construction feeding the synthetic data pipeline.",
        roles: ["saturn-labs"],
      },
      {
        name: "ROS2",
        level: 45,
        description:
          "Node graphs, topics and system integration for a rover control stack.",
        roles: ["vicharaka"],
      },
    ],
  },
  {
    id: "mathematics",
    title: "Mathematics and Formal Methods",
    summary:
      "The degree, and the reason the compression work reads as mathematics rather than as trial and error.",
    accent: "var(--primary)",
    skills: [
      {
        name: "Linear Algebra",
        level: 95,
        description:
          "Vector spaces, eigendecomposition, SVD and the matrix calculus every one of these models is written in.",
        evidence: ["vit-compression", "wackystuff"],
      },
      {
        name: "Calculus",
        level: 90,
        description:
          "Multivariable calculus, gradient-based optimisation, and the analysis underneath backpropagation.",
      },
      {
        name: "Probability and Statistics",
        level: 85,
        description:
          "Statistical modelling, hypothesis testing and Bayesian methods, plus the quantile construction NF4 quantisation is built on.",
        evidence: ["vit-compression"],
      },
      {
        name: "Optimisation Theory",
        level: 80,
        description:
          "Convex optimisation, descent methods and constrained problems, applied to both training schedules and Pareto-frontier analysis.",
        evidence: ["vit-compression"],
      },
      {
        name: "Lean 4",
        level: 70,
        description:
          "Dependent types and tactic-mode proof, used to carry correctness arguments alongside a collision detection implementation rather than testing after the fact.",
        roles: ["emergence-ai"],
      },
      {
        name: "Formal Verification",
        level: 68,
        description:
          "Proving a property holds for every input rather than sampling inputs and hoping. Exact rational arithmetic in place of IEEE-754, so determinism is a theorem and not an observation.",
        roles: ["emergence-ai"],
      },
      {
        name: "Numerical Methods",
        level: 68,
        description:
          "Interpolation, resampling and error analysis. The uniform five-metre distance grid in the telemetry work is a numerical methods answer to a plotting question.",
        evidence: ["f1-telemetry"],
      },
      {
        name: "Automata Theory",
        level: 62,
        description:
          "Formal languages, finite automata and decidability. Coursework, and the vocabulary the Lean work borrows its state machine from.",
      },
      {
        name: "Information Theory",
        level: 60,
        description:
          "Shannon entropy as a working tool, ranking attention heads by how unfocused they are, and error detection as a design layer: Reed-Solomon, CRC32 and a whole-payload hash stacked so a misread frame can never become a corrupt file.",
        evidence: ["vit-compression", "wackystuff"],
      },
      {
        name: "Group Theory",
        level: 30,
        learning: true,
        description:
          "Abstract algebraic structures and their applications in cryptography and physics. Coursework in progress.",
      },
    ],
  },
]

/** Flattened. Used for the search index and the count on the home page. */
export const allSkills: Skill[] = skillCategories.flatMap((c) => c.skills)

/** High to low by default; the explorer can flip it. */
export function sortSkills(skills: Skill[], order: "desc" | "asc"): Skill[] {
  return [...skills].sort((a, b) =>
    order === "asc" ? a.level - b.level : b.level - a.level
  )
}
