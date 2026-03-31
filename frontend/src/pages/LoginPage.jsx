import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../state/AuthContext.jsx";

const PasswordToggle = ({ visible, onClick }) => (
  <button
    aria-label={visible ? "Hide password" : "Show password"}
    className="grid h-9 w-9 place-items-center rounded-full text-white/42 transition hover:bg-white/5 hover:text-white/80"
    onClick={onClick}
    type="button"
  >
    {visible ? (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.55 1.55-1.47 2.94-2.66 4.06" />
        <path d="M6.61 6.61C4.62 8 3.17 9.82 2 12c1.73 4.89 6 8 10 8 1.73 0 3.39-.37 4.88-1.03" />
      </svg>
    ) : (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.64-8 10-8 10 8 10 8-3.64 8-10 8-10-8-10-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const justCreated = Boolean(location.state?.justCreated);

  const payload = useMemo(() => {
    const identifier = form.identifier.trim();
    const looksLikeEmail = identifier.includes("@");

    return {
      username: looksLikeEmail ? "" : identifier,
      email: looksLikeEmail ? identifier : "",
      password: form.password,
    };
  }, [form.identifier, form.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(payload);

      navigate(location.state?.from || "/feed");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      asideBadge="Welcome back"
      asideDescription="Jump back into your uploads, your studio metrics, and the channel identity you are building."
      asidePoints={[
        "Use your username or email to get back into your account.",
        "Your session stays alive with the refresh-token flow behind the scenes.",
        "Once you are in, studio, uploads, and channel management are right where you left them.",
      ]}
      asideTitle="Sign in and pick up where your last upload left off."
      badge="Sign in"
      description="Use your email or username to continue into VideoTube. The auth page now matches the dark landing-page theme instead of the dashboard shell."
      title="Welcome back."
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {justCreated ? (
          <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm leading-7 text-emerald-300">
            Your account was created. Sign in to open your channel and studio.
          </div>
        ) : null}

        <AuthInput
          autoComplete="username"
          icon="at"
          label="Email or username"
          onChange={(event) =>
            setForm((current) => ({ ...current, identifier: event.target.value }))
          }
          placeholder="Enter your email or username"
          required
          value={form.identifier}
        />

        <AuthInput
          autoComplete="current-password"
          icon="lock"
          label="Password"
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="Enter your password"
          required
          trailing={
            <PasswordToggle
              onClick={() => setShowPassword((current) => !current)}
              visible={showPassword}
            />
          }
          type={showPassword ? "text" : "password"}
          value={form.password}
        />

        {error ? (
          <p className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            className="inline-flex rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
          <Link
            className="inline-flex rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
