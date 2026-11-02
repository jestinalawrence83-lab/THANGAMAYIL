
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Phone,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Captcha from "../components/Captcha";
import "./Auth.css";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  }

  const passwordStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
              form.password
            )
          ? 3
          : 2;

  async function handleRegister(event) {
    event.preventDefault();

    if (loading) return;

    if (form.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!captchaVerified) {
      toast.error("Please complete the security verification.");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Registration response is incomplete.");
      }

      localStorage.removeItem("thangamayil_token");
      localStorage.removeItem("thangamayil_user");
      localStorage.removeItem("thangamayil_logged_in");

      sessionStorage.removeItem("thangamayil_token");
      sessionStorage.removeItem("thangamayil_user");
      sessionStorage.removeItem("thangamayil_logged_in");

      localStorage.setItem("thangamayil_token", data.token);
      localStorage.setItem("thangamayil_user", JSON.stringify(data.user));
      localStorage.setItem("thangamayil_logged_in", "true");

      toast.success("Welcome to THANGAMAYIL!");

      navigate(data.user.role === "admin" ? "/admin" : "/account", {
        replace: true,
      });
    } catch (error) {
      console.error("Registration error:", error);

      toast.error(
        error.message === "Failed to fetch"
          ? "Cannot connect to server. Check your backend."
          : error.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lux-auth tm-auth-page">
      <header className="lux-nav">
        <Link to="/" className="lux-brand">
          <span className="lux-brand-mark">❧</span>
          <span>
            <strong>THANGAMAYIL</strong>
            <small>J E W E L L E R Y</small>
          </span>
        </Link>

        <Link to="/login" className="lux-nav-link">
          Sign in <ArrowRight size={15} />
        </Link>
      </header>

      <section className="tm-auth-layout">
        <aside className="tm-temple-panel">
          <div className="tm-temple-shade" />

          <div className="tm-temple-brand">
            <span className="tm-ornament">✦</span>
            <p>A LEGACY OF TIMELESS BEAUTY</p>
            <h2>
              More than jewellery.
              <br />
              <em>A legacy.</em>
            </h2>
            <span className="tm-ornament">❧</span>
            <p className="tm-temple-tagline">
              JEWELS OF HERITAGE
            </p>
          </div>

          <div className="tm-temple-bottom">
            <span>TIMELESS CRAFT</span>
            <span>ENDURING BEAUTY</span>
          </div>
        </aside>

        <section className="lux-form-panel tm-auth-card">
          <Link to="/" className="lux-back">
            <ArrowLeft size={15} /> Back to store
          </Link>

          <div className="lux-form-inner lux-register-inner">
            <div className="lux-emblem">
              <Sparkles size={23} />
            </div>

            <p className="lux-kicker">JOIN OUR HERITAGE</p>

            <h1>
              Begin your <em>legacy.</em>
            </h1>

            <p className="lux-description">
              Create your account and discover pieces to treasure forever.
            </p>

            <form className="lux-form" onSubmit={handleRegister}>
              <label htmlFor="register-name">Full name</label>

              <div className="lux-input">
                <UserRound size={18} />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your full name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </div>

              <label htmlFor="register-email">Email address</label>

              <div className="lux-input">
                <Mail size={18} />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="register-mobile">Mobile number</label>

              <div className="lux-input">
                <Phone size={18} />
                <input
                  id="register-mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={updateField}
                  placeholder="10-digit mobile number"
                  autoComplete="tel-national"
                  maxLength={10}
                  required
                />
              </div>

              <label htmlFor="register-password">Password</label>

              <div className="lux-input">
                <LockKeyhole size={18} />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="lux-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="lux-strength">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={
                      passwordStrength >= level
                        ? `strength-${passwordStrength}`
                        : ""
                    }
                  />
                ))}
              </div>

              <p className="lux-note">
                Use 8+ characters with uppercase, lowercase, a number and a symbol.
              </p>

              <label htmlFor="register-confirm">Confirm password</label>

              <div className="lux-input">
                <LockKeyhole size={18} />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={updateField}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="lux-eye"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((value) => !value)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Captcha onVerify={setCaptchaVerified} />

              <label className="lux-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  I agree to the terms and conditions and privacy policy.
                </span>
              </label>

              <button className="lux-submit" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create your account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="lux-switch">
              Already a member? <Link to="/login">Sign in</Link>
            </p>

            <div className="lux-secure-note">
              <ShieldCheck size={14} />
              A treasured experience starts here
            </div>
          </div>
        </section>
      </section>

      <footer className="lux-footer">
        <span>© {new Date().getFullYear()} THANGAMAYIL JEWELLERY</span>
        <span>Crafted with care · Made to be treasured</span>
        <Link to="/">Return to store</Link>
      </footer>
    </main>
  );
}
