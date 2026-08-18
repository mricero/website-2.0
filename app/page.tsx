import { Hero } from "@/components/sections/hero"
import { ExperienceSection } from "@/components/sections/experience"
import { ProjectsSection } from "@/components/sections/projects"
import { ContactSection } from "@/components/sections/contact"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </>
  )
}
