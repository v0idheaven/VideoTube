import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";
import LandingPageMarketing from "./LandingPageMarketing.jsx";

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      setLoading(true);

      try {
        const response = await apiRequest("/api/v1/videos", {}, { skipRefresh: true });
        const docs = response?.data?.docs || [];

        if (!cancelled) {
          setVideos(docs);
        }
      } catch (requestError) {
        void requestError;
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  if (user) {
    return <Navigate replace to="/feed" />;
  }

  return <LandingPageMarketing loading={loading} user={user} videos={videos} />;
};

export default HomePage;
