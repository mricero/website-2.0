import type { Experience } from "@/types"

export const experiences: Experience[] = [
  {
    id: "vicharaka",
    role: "Core Technical Member",
    organization: "Team Vicharaka, IISc — Robotics Club",
    duration: "Feb 2025 — Present",
    description: [
      "Designing chassis geometry, suspension, and mechanical mounts for a Mars Rover prototype.",
      "Managing technical budgets and sponsorship relationships with ARTPARK IISc and Ansys.",
      "Represented the team on stage at the IISc B.Tech Mathematics & Computing counselling programme.",
    ],
    skills: ["SolidWorks", "ROS2", "System Integration", "Mechanical Design"],
  },
  {
    id: "saturn-labs",
    role: "Robotics Intern",
    organization: "Saturn Labs",
    duration: "2024",
    description: [
      "Built simulation environments and processed high-volume telemetry for autonomous systems.",
      "Optimised data-processing pipelines to cut turnaround on large telemetry runs.",
    ],
    skills: ["Python", "Simulation", "Data Processing", "Docker"],
  },
]
