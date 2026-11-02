
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import Captcha from "../components/Captcha";
import "./Auth.css";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    if (!captchaVerified) {
      toast.error("Please complete the security verification.");
      return;
    }

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server.");
      }

      if (!["admin", "customer", "user"].includes(data.user.role)) {
        throw new Error("Your account role is not valid.");
      }

      localStorage.removeItem("thangamayil_token");
      localStorage.removeItem("thangamayil_user");
      localStorage.removeItem("thangamayil_logged_in");

      sessionStorage.removeItem("thangamayil_token");
      sessionStorage.removeItem("thangamayil_user");
      sessionStorage.removeItem("thangamayil_logged_in");

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("thangamayil_token", data.token);
      storage.setItem("thangamayil_user", JSON.stringify(data.user));
      storage.setItem("thangamayil_logged_in", "true");

      toast.success(`Welcome back, ${data.user.name || "Customer"}!`);

      navigate(data.user.role === "admin" ? "/admin" : "/account", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error.message === "Failed to fetch"
          ? "Cannot connect to server. Check whether backend is running."
          : error.message || "Unable to sign in."
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

        <Link to="/register" className="lux-nav-link">
          Create account <ArrowRight size={15} />
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

          <div className="lux-form-inner">
            <div className="lux-emblem">
              <Sparkles size={23} />
            </div>

            <p className="lux-kicker">WELCOME BACK</p>

            <h1>
              Your world of <em>elegance.</em>
            </h1>

            <p className="lux-description">
              Sign in to discover timeless designs and treasured collections.
            </p>

            <div className="lux-steps">
              <span className="active">
                <b>1</b> Account
              </span>
              <i />
              <span>
                <b>2</b> Welcome
              </span>
            </div>

            <form className="lux-form" onSubmit={handleLogin}>
              <label htmlFor="login-email">Email address</label>

              <div className="lux-input">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="login-password">Password</label>

              <div className="lux-input">
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

              <Captcha onVerify={setCaptchaVerified} />

              <label className="lux-terms">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>

              <p className="lux-note">
                Sign in securely using your registered email and password.
              </p>

              <button className="lux-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in securely"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="lux-switch">
              New to THANGAMAYIL?{" "}
              <Link to="/register">Create an account</Link>
            </p>

            <div className="lux-secure-note">
              <ShieldCheck size={14} />
              Your details are protected
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
