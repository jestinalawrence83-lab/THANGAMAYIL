
import { useEffect, useRef, useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import "./HeroCarousel.css";

const slides = [
  {
    type: "image",
    eyebrow: "THE HERITAGE BRIDAL COLLECTION",
    title: (
      <>
        Tradition,
        <br />
        <em>Woven in Gold.</em>
      </>
    ),
    description:
      "Discover jewellery that celebrates your story, honours your heritage, and becomes part of your legacy.",
    image: "/images/thangamayil-bridal-hero.png",
    imageAlt: "South Indian bride wearing traditional temple jewellery",
    imagePosition: "center 35%",
    caption: "THE HERITAGE EDIT",
    subcaption: "Jewels to treasure forever",
    note: "Timeless designs. Meaningful moments.",
    duration: 6000,
  },
  {
    type: "video",
    eyebrow: "THE FESTIVE COLLECTION",
    title: (
      <>
        A Diwali of
        <br />
        <em>Golden Moments.</em>
      </>
    ),
    description:
      "Celebrate the light of tradition with THANGAMAYIL and discover jewellery made for unforgettable occasions.",
    video: "/videos/diwali-ad.mp4",
    caption: "THANGAMAYIL",
    subcaption: "JEWELS OF HERITAGE",
    note: "A celebration of light, love and legacy.",
    duration: 8500,
  },
  {
    type: "image",
    eyebrow: "CRAFTED FOR YOUR MOMENTS",
    title: (
      <>
        Elegance in
        <br />
        <em>Every Detail.</em>
      </>
    ),
    description:
      "Discover treasured designs made to accompany your most beautiful moments.",
    image: "https://www.gprjewellers.com/assets/bridal_gold_set.png",
    imageAlt: "Traditional bridal gold jewellery collection",
    imagePosition: "center",
    caption: "THE SIGNATURE EDIT",
    subcaption: "A legacy in every jewel",
    note: "Made for memories that last.",
    duration: 6000,
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const videoRef = useRef(null);

  const currentSlide = slides[active];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActive((previous) => (previous + 1) % slides.length);
    }, currentSlide.duration);

    if (currentSlide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;

      const playPromise = videoRef.current.play();

      if (playPromise) {
        playPromise.catch(() => {});
      }
    }

    return () => window.clearTimeout(timer);
  }, [active, currentSlide]);

  return (
    <section className="tm-hero-carousel">
      <div className="tm-hero-copy" key={`copy-${active}`}>
        <span className="tm-hero-eyebrow">
          <Sparkles size={15} />
          {currentSlide.eyebrow}
        </span>

        <h1>{currentSlide.title}</h1>

        <p>{currentSlide.description}</p>

        <a href="/products" className="tm-hero-cta">
          EXPLORE COLLECTION
          <Gem size={17} />
        </a>

        <div className="tm-hero-note">
          <Gem size={17} />
          <span>{currentSlide.note}</span>
        </div>
      </div>

      <div className="tm-hero-media" key={`media-${active}`}>
        {currentSlide.type === "video" ? (
          <video
            ref={videoRef}
            className="tm-hero-video"
            src={currentSlide.video}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
          />
        ) : (
          <img
            src={currentSlide.image}
            alt={currentSlide.imageAlt}
            style={{ objectPosition: currentSlide.imagePosition }}
            loading="eager"
          />
        )}

        <div className="tm-hero-caption">
          <span>{currentSlide.caption}</span>
          <strong>{currentSlide.subcaption}</strong>
        </div>
      </div>

      <div className="tm-hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.caption}
            type="button"
            className={active === index ? "active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
