import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleHero() {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  if (!engineReady) return null;

  return (
    <Particles
      id="hero-particles"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
          },
          modes: {
            grab: {
              distance: 180,
              links: { opacity: 0.8 },
            },
          },
        },
        particles: {
          color: { value: ["#ffffff", "#e94560"] },
          links: {
            color: "#ffffff",
            distance: 130,
            enable: true,
            opacity: 0.15,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.2,
            outModes: { default: "bounce" },
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80,
          },
          opacity: { value: { min: 0.3, max: 0.8 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: { number: { value: 30 } },
            },
          },
        ],
        detectRetina: true,
      }}
    />
  );
}
