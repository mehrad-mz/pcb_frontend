import LandingPageContent from "@/components/landing/LandingPageContent";
import LandingSceneShell from "@/components/landing/LandingSceneShell";
import "./landing.css";

export default function Home() {
  return (
    <>
      <noscript>
        <style>{`
          .landing-body--loading .landing-scroll,
          .landing-body--loading .landing-nav {
            opacity: 1 !important;
            visibility: visible !important;
          }
          .landing-scene-loader {
            display: none !important;
          }
          .landing-body--loading {
            overflow: auto;
            height: auto;
          }
        `}</style>
      </noscript>
      <LandingSceneShell>
        <LandingPageContent />
      </LandingSceneShell>
    </>
  );
}
