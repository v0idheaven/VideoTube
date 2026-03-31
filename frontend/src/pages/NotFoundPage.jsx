import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";

const NotFoundPage = () => {
  return (
    <EmptyState
      description="That route does not exist in the React client yet."
      title="Page not found"
      action={
        <Link className="gradient-button" to="/feed">
          Back to feed
        </Link>
      }
    />
  );
};

export default NotFoundPage;
