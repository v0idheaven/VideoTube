import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-6">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
              <svg className="h-8 w-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
            <p className="text-sm text-white/55">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="gradient-button !px-4 !py-2 text-sm"
                onClick={() => this.setState({ hasError: false, error: null })}
                type="button"
              >
                Try again
              </button>
              <Link className="alt-button !px-4 !py-2 text-sm" to="/feed">
                Go to feed
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
