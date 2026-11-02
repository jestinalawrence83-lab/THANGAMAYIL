
import "./DiwaliVideoBanner.css";

export default function DiwaliVideoBanner() {
  return (
    <section className="diwali-video-section">
      <div className="diwali-video-heading">
        <span>THE FESTIVE COLLECTION</span>
        <h2>A Diwali <em>of Golden Moments</em></h2>
        <p>Celebrate the light of tradition with THANGAMAYIL.</p>
      </div>

      <div className="diwali-video-frame">
        <video
          className="diwali-video"
          src="/videos/diwali-ad.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          aria-label="THANGAMAYIL Diwali jewellery advertisement"
        />
        <div className="diwali-video-brand">
          <span>THANGAMAYIL</span>
          <small>JEWELS OF HERITAGE</small>
        </div>
      </div>
    </section>
  );
}
