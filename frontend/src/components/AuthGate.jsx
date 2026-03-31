import { Link } from "react-router-dom";
import EmptyState from "./EmptyState.jsx";

const AuthGate = ({ title, description }) => {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap gap-3">
          <Link className="gradient-button" to="/login">
            Sign In
          </Link>
          <Link className="alt-button" to="/register">
            Create Account
          </Link>
        </div>
      }
    />
  );
};

export default AuthGate;
