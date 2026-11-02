
import { useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

function createQuestion() {
  const first = Math.floor(Math.random() * 9) + 1;
  const second = Math.floor(Math.random() * 9) + 1;

  return {
    first,
    second,
    answer: first + second,
  };
}

export default function Captcha({ onVerify }) {
  const [question, setQuestion] = useState(createQuestion);
  const [answer, setAnswer] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  function refreshCaptcha() {
    setQuestion(createQuestion());
    setAnswer("");
    setVerified(false);
    setError("");
    onVerify(false);
  }

  function checkCaptcha() {
    if (!answer.trim()) {
      setError("Please solve the security question.");
      setVerified(false);
      onVerify(false);
      return;
    }

    if (Number(answer) === question.answer) {
      setError("");
      setVerified(true);
      onVerify(true);
    } else {
      setError("Incorrect answer. Please try again.");
      setVerified(false);
      onVerify(false);
      setAnswer("");
      setQuestion(createQuestion());
    }
  }

  return (
    <div className="lux-captcha">
      <div className="lux-captcha-heading">
        <ShieldCheck size={18} />
        <span>Security Verification</span>
      </div>

      <div className="lux-captcha-question">
        <strong>
          {question.first} + {question.second} = ?
        </strong>

        <button
          type="button"
          onClick={refreshCaptcha}
          aria-label="Refresh CAPTCHA"
          title="New question"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="lux-captcha-input">
        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setVerified(false);
            setError("");
            onVerify(false);
          }}
          placeholder="Enter your answer"
          aria-label="CAPTCHA answer"
        />

        <button type="button" onClick={checkCaptcha}>
          Verify
        </button>
      </div>

      {error && <p className="lux-captcha-error">{error}</p>}

      {verified && (
        <p className="lux-captcha-success">
          <ShieldCheck size={14} />
          Verification successful
        </p>
      )}
    </div>
  );
}
