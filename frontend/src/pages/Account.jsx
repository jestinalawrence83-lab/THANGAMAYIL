
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LogIn,
  Mail,
  Phone,
  UserRound,
  ShoppingBag,
} from "lucide-react";
import "./Account.css";

export default function Account() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("thangamayil_user") || "null"
    );
  } catch {
    user = null;
  }

  const isLoggedIn =
    localStorage.getItem("thangamayil_logged_in") === "true";

  if (!user || !isLoggedIn) {
    return (
      <main className="account-page">
        <section className="account-card">
          <Link to="/" className="account-back">
            <ArrowLeft size={16} />
            Back to store
          </Link>

          <span className="account-symbol">✦</span>

          <span className="account-eyebrow">
            WELCOME TO THANGAMAYIL
          </span>

          <h1>
            Your world of <em>elegance.</em>
          </h1>

          <p className="account-intro">
            Sign in to your account or create a new account
            to continue your jewellery journey.
          </p>

          <button
            type="button"
            className="account-button"
            onClick={() => navigate("/login")}
          >
            <LogIn size={18} />
            Sign In
          </button>

          <button
            type="button"
            className="account-secondary-button"
            onClick={() => navigate("/register")}
          >
            Create an Account
          </button>

          <p className="account-note">
            Authentication is currently in demo mode.
            Secure login and OTP verification will be connected
            in the backend authentication step.
          </p>
        </section>
      </main>
    );
  }

  function handleLogout() {
    localStorage.removeItem("thangamayil_logged_in");
    navigate("/login");
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <Link to="/" className="account-back">
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <span className="account-symbol">✦</span>

        <span className="account-eyebrow">
          YOUR THANGAMAYIL PROFILE
        </span>

        <h1>
          Welcome, <em>{user.name}</em>
        </h1>

        <p className="account-intro">
          Your account details
        </p>

        <div className="account-detail">
          <UserRound size={19} />
          <div>
            <span>Full name</span>
            <strong>{user.name}</strong>
          </div>
        </div>

        <div className="account-detail">
          <Mail size={19} />
          <div>
            <span>Email address</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="account-detail">
          <Phone size={19} />
          <div>
            <span>Mobile number</span>
            <strong>{user.phone}</strong>
          </div>
        </div>

        <button
          type="button"
          className="account-button"
          onClick={() => navigate("/cart")}
        >
          <ShoppingBag size={18} />
          View Shopping Bag
        </button>

        <button
          type="button"
          className="account-secondary-button"
          onClick={handleLogout}
        >
          Sign Out
        </button>

        <p className="account-note">
          Demo profile: account details are saved in this browser.
        </p>
      </section>
    </main>
  );
}
