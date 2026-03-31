import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ChannelPage from "./pages/ChannelPage.jsx";
import FeedExperiencePage from "./pages/FeedExperiencePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LikedVideosPage from "./pages/LikedVideosPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PlaylistDetailPage from "./pages/PlaylistDetailPage.jsx";
import PlaylistsPage from "./pages/PlaylistsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SettingsHubPage from "./pages/SettingsHubPage.jsx";
import StudioHubPage from "./pages/StudioHubPage.jsx";
import SubscriptionsPage from "./pages/SubscriptionsPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";

const App = () => {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />

      <Route element={<AppShell />} path="/">
        <Route element={<FeedExperiencePage />} path="feed" />
        <Route element={<SubscriptionsPage />} path="subscriptions" />
        <Route element={<HistoryPage />} path="history" />
        <Route element={<LikedVideosPage />} path="liked" />
        <Route element={<PlaylistsPage />} path="playlists" />
        <Route element={<PlaylistDetailPage />} path="playlists/:playlistId" />
        <Route element={<StudioHubPage />} path="studio" />
        <Route element={<UploadPage />} path="upload" />
        <Route element={<SettingsHubPage />} path="settings" />
        <Route element={<WatchPage />} path="watch/:videoId" />
        <Route element={<ChannelPage />} path="channel/:username" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
};

export default App;
