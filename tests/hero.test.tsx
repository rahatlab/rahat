/**
 * Hero Component Tests
 * Tests the homepage hero section rendering and functionality
 */

import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/site/hero";

describe("Hero Component", () => {
  const defaultSettings = {
    name: "Rahat",
    headline: "I build fast, beautiful products for the web.",
    bio: "Full-stack engineer with 7+ years shipping production apps in React, Next.js, Node and Postgres. I care about performance, accessibility and interfaces that feel effortless.",
    roles: ["Full-Stack Web Developer", "UI/UX Architect", "Problem Solver", "Open Source Contributor"],
    available: true,
    availabilityText: "Available for freelance",
    cvUrl: "/alex-rivera-cv.pdf",
    cvFileName: "alex-rivera-cv.pdf",
    location: "Lisbon, Portugal · Remote",
  };

  beforeEach(() => {
    render(<Hero settings={defaultSettings} />);
  });

  it("renders headline as a level-1 heading", () => {
    const headline = screen.getByRole("heading", { level: 1 });
    expect(headline).toHaveTextContent("I build fast, beautiful products for the web.");
  });

  it("greets with the configured name", () => {
    expect(screen.getByText("Hi, I'm Rahat")).toBeInTheDocument();
  });

  it("exposes all roles to screen readers via the Typewriter sr-only text", () => {
    // Typewriter renders an animated span plus a static sr-only list for a11y.
    const roles = screen.getByText(
      "Full-Stack Web Developer, UI/UX Architect, Problem Solver, Open Source Contributor",
      { selector: ".sr-only" },
    );
    expect(roles).toBeInTheDocument();
  });

  it("renders bio text", () => {
    expect(screen.getByText(defaultSettings.bio)).toBeInTheDocument();
  });

  it("renders CTA as a link and a download button", () => {
    const exploreLink = screen.getByRole("link", { name: /Explore Projects/i });
    expect(exploreLink).toHaveAttribute("href", "#projects");

    const downloadBtn = screen.getByRole("button", { name: /Download CV/i });
    expect(downloadBtn).toBeInTheDocument();
  });

  it("renders availability status when available", () => {
    expect(screen.getByText("Available for freelance")).toBeInTheDocument();
  });

  it("renders location information", () => {
    expect(screen.getByText("Lisbon, Portugal · Remote")).toBeInTheDocument();
  });
});
