import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.set("fullName", form.fullName);
    formData.set("username", form.username);
    formData.set("email", form.email);
    formData.set("password", form.password);

    try {
      await register(formData);
      navigate("/login", {
        state: {
          justCreated: true,
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      asideBadge="Create your account"
      asideDescription="Claim your username, create the account fast, and step straight into your creator dashboard. Profile visuals now live inside settings."
      asidePoints={[
        "Sign up only asks for the essentials so onboarding feels quick.",
        "Avatar and cover image can be uploaded later from the settings page.",
        "Once you finish, sign in and head into studio or settings whenever you are ready.",
      ]}
      asideTitle="Create the account first. Shape the identity after."
      badge="Join VideoTube"
      description="This is the creator onboarding step. Set up the core account first, then personalize avatar and cover image from settings."
      title="Create your account."
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthInput
            autoComplete="name"
            icon="user"
            label="Full name"
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder="Your full name"
            required
            value={form.fullName}
          />

          <AuthInput
            autoComplete="username"
            icon="at"
            label="Username"
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
            placeholder="Choose a username"
            required
            value={form.username}
          />

          <AuthInput
            autoComplete="email"
            icon="mail"
            label="Email"
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="you@example.com"
            required
            type="email"
            value={form.email}
          />

          <AuthInput
            autoComplete="new-password"
            icon="lock"
            label="Password"
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Create a password"
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
        </div>

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
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <Link
            className="inline-flex rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            to="/login"
          >
            Already have an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
