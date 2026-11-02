
import "./StoreLocation.css";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Thangamayil+Jewellery%2C+17+Cutchery+Street%2C+Mayiladuthurai%2C+Tamil+Nadu+609001";

export default function StoreLocation() {
  return (
    <section className="tm-luxury-footer">
      <div className="tm-footer-overlay" />

      <div className="tm-footer-main">
        <div className="tm-footer-store">
          <div className="tm-footer-eyebrow">
            <span />
            VISIT OUR SHOWROOM
            <span />
          </div>

          <h2>Experience the Elegance</h2>

          <p className="tm-footer-intro">
            Discover the beauty of traditional jewellery
            at THANGAMAYIL.
          </p>

          <div className="tm-footer-address">
            <div className="tm-location-symbol">●</div>

            <div>
              <h3>THANGAMAYIL JEWELLERY</h3>
              <p>
                17, Cutchery Street, near Head Post Office,
                Mayiladuthurai – 609001, Tamil Nadu.
              </p>
            </div>
          </div>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-footer-directions"
          >
            GET DIRECTIONS <span>↗</span>
          </a>
        </div>

        <div className="tm-footer-qr-card">
          <div className="tm-qr-decoration">❀</div>

          <h3>SCAN TO FIND US</h3>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-footer-qr-image"
            aria-label="Open THANGAMAYIL location in Google Maps"
          >
            <img
              src="/images/thangamayil-location-qr.png"
              alt="THANGAMAYIL showroom location QR code"
            />
          </a>

          <p>
            Open your camera and scan to view our
            location on Google Maps.
          </p>

          <div className="tm-qr-brand">
            <span />
            THANGAMAYIL ✦ MAYILADUTHURAI
            <span />
          </div>
        </div>
      </div>

      <footer className="tm-footer-bottom">
        <h2 className="tm-footer-logo">THANGAMAYIL</h2>

        <p className="tm-footer-tagline">
          Tradition, woven in gold.
        </p>

        <nav className="tm-footer-navigation">
          <a href="/">Home</a>
          <a href="/login">Sign In</a>
          <a href="/register">Create Account</a>
          <a href="/cart">Shopping Bag</a>
        </nav>

        <div className="tm-footer-divider">
          <span>◆</span>
        </div>

        <p className="tm-footer-copyright">
          © {new Date().getFullYear()} THANGAMAYIL.
          All rights reserved.
        </p>
      </footer>
    </section>
  );
}
