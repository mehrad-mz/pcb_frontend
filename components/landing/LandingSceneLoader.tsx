export default function LandingSceneLoader() {
  return (
    <div className="landing-scene-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="landing-scene-loader-inner">
        <img src="/logo.svg" alt="" className="landing-scene-loader-logo" aria-hidden="true" />
        <p className="landing-scene-loader-text">در حال بارگذاری..</p>
        <div className="landing-scene-loader-bar" aria-hidden="true">
          <span className="landing-scene-loader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
