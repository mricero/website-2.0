import type { Project } from "@/types"

/**
 * Content source: .research/FINDINGS.md
 * Every claim here traces to a repository README. No repo on this account has a
 * GitHub description, topic, or homepage set, so all copy is written from the
 * README bodies rather than lifted from API metadata.
 */
export const projects: Project[] = [
  {
    id: "legal-rag",
    title: "Multi-Tenant Legal RAG Assistant",
    category: "Systems",
    period: "2026",
    shortDescription:
      "A legal-document retrieval system with two ingestion engines, hybrid search, and per-session document isolation — a FastAPI backend behind a Cloudflare tunnel serving a static React SPA.",
    highlight:
      "Retrieval fuses BM25 and dense-vector *ranks*, not scores: a cosine distance and a BM25 score share no scale, so any normalisation between them ends up tuned to one corpus and wrong on the next. The lexical leg exists because an embedding blurs exactly the rare token — \"Section 302\" — that made the question specific.",
    techStack: [
      "FastAPI",
      "Celery",
      "Redis",
      "ChromaDB",
      "BM25",
      "React",
      "PyTorch",
      "SQLite",
    ],
    featured: true,
    links: { github: "https://github.com/mricero/legal-assistant" },
  },
  {
    id: "kurt",
    title: "Kurt — Offline-First AI Tutor",
    category: "AI/ML",
    period: "2026",
    shortDescription:
      "A fully local desktop assistant that transcribes lectures, answers questions grounded in your own documents, and compiles the result into typeset PDFs — no network required.",
    highlight:
      "Tkinter has no MathJax, so multi-line equations are intercepted from the model's output and rendered through matplotlib's typesetting engine into transparent PNGs embedded inline — real maths in a desktop chat window, entirely offline.",
    techStack: [
      "Python",
      "faster-whisper",
      "Ollama",
      "ChromaDB",
      "LangChain",
      "customtkinter",
      "Tectonic",
      "CUDA",
    ],
    image: "/projects/kurt-tutor-chat.webp",
    imageAlt:
      "Kurt's tutor chat interface showing a grounded answer with an inline-rendered mathematical equation",
    featured: true,
    links: { github: "https://github.com/mricero/meeting-summary" },
  },
  {
    id: "f1-telemetry",
    title: "F1 Telemetry Dashboard",
    category: "Web",
    period: "2026",
    shortDescription:
      "Live and historical Formula 1 telemetry — speed, throttle, brake, RPM, gear, DRS, tyre strategy and a GPS track map — streaming from F1's official timing feed with no paid tier.",
    highlight:
      "Drivers cross the line at different moments, so speed-against-time never lines up. Telemetry is interpolated onto a uniform five-metre distance grid, which is what makes two drivers genuinely comparable at the same braking point.",
    techStack: [
      "Streamlit",
      "Plotly",
      "FastF1",
      "SignalR",
      "pandas",
      "NumPy",
      "PyArrow",
    ],
    featured: true,
    links: { github: "https://github.com/mricero/F1-Telemetry-Dashboard" },
  },
  {
    id: "vit-compression",
    title: "ViT Compression Trade-offs",
    category: "Research",
    period: "2026",
    shortDescription:
      "A study of four Vision Transformer compression paradigms — token merging, threshold masking, post-training quantisation, and entropy-based head pruning — mapped across a 24-combination sweep of the Pareto frontier.",
    highlight:
      "Deleting tokens outright breaks the 2D spatial grid that hybrid convolutional models need, so token importance is proxied by L2 norm and low-importance embeddings are zeroed instead — the tensor keeps its shape and the downstream convolutions still work.",
    techStack: [
      "PyTorch",
      "ToMe",
      "bitsandbytes",
      "NF4 / INT8",
      "timm",
      "CUDA",
      "Jupyter",
    ],
    image: "/projects/vit-baseline-pareto.webp",
    imageAlt:
      "Pareto curve plotting Vision Transformer accuracy against inference latency across compression settings",
    imageTreatment: "chart",
    featured: true,
    links: { github: "https://github.com/mricero/aiml_project_dir2" },
  },
  {
    id: "image-to-latex",
    title: "Image-to-LaTeX Handwriting OCR",
    category: "AI/ML",
    period: "2026",
    shortDescription:
      "A 2D-attention encoder-decoder that reads handwritten text and mathematical expressions and emits LaTeX autoregressively — ResNet-18 features into a four-layer Transformer decoder over a 1,007-token vocabulary.",
    highlight:
      "A flattened feature map loses the two-dimensional layout that makes a fraction a fraction, so the encoder carries separate sinusoidal encodings for the X and Y axes — the decoder can tell what sits above the bar from what sits below it.",
    techStack: [
      "PyTorch",
      "ResNet-18",
      "Transformers",
      "AMP / FP16",
      "Flash Attention",
      "CUDA",
    ],
    featured: true,
    links: { github: "https://github.com/mricero/ocr-2.0" },
  },

  /* --- secondary: real work, smaller scope --- */
  {
    id: "latek-converter",
    title: "LaTeX Converter",
    category: "AI/ML",
    period: "2026",
    shortDescription:
      "The earlier image-to-LaTeX pipeline — dataset assembly, training loop, and logging — that the 2D-attention model above grew out of.",
    techStack: ["PyTorch", "Hugging Face Datasets", "Python"],
    featured: false,
    links: { github: "https://github.com/mricero/latek-converter" },
  },
  {
    id: "hand-gesture-drawing",
    title: "Hand-Gesture Drawing Tool",
    category: "AI/ML",
    period: "2025",
    shortDescription:
      "Draw in the air: real-time hand tracking turns fingertip position into strokes on a live camera feed.",
    techStack: ["MediaPipe", "OpenCV", "Python"],
    featured: false,
    links: { github: "https://github.com/mricero/hand-gesture-drawing-tool" },
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
export const otherProjects = projects.filter((p) => !p.featured)
