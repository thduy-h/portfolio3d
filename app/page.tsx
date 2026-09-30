import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { SelectedProjects } from "@/components/sections/SelectedProjects";
import { AboutSection } from "@/components/sections/AboutSection";
import { StackSection } from "@/components/sections/StackSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { GitHubSection } from "@/components/sections/GitHubSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SelectedProjects />
        <AboutSection />
        <StackSection />
        <ExperienceSection />
        <GitHubSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
