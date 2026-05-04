import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChatDock } from './components/ChatDock';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { CatalogPage } from './pages/CatalogPage';
import { GamePage } from './pages/GamePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { FriendsPage } from './pages/FriendsPage';
import { ChatPage } from './pages/ChatPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShopPage } from './pages/ShopPage';
import { useTranslation } from './i18n/I18nContext';

export function App() {
  const { t } = useTranslation();
  return (
    <div className="app-shell">
      <Navbar />
      <ChatDock />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/:id"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/developer"
            element={
              <ProtectedRoute>
                <DeveloperPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <ShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute allowSecurity>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="container">
                <h1>404</h1>
                <p>Page not found.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="container app-footer__inner">
          <p>{t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
}
