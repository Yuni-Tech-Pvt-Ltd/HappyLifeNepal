import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import DonationDetailPage from '@/pages/DonationDetailPage';
import EventDetailPage from '@/pages/EventDetailPage';
import BlogDetailPage from '@/pages/BlogDetailPage';
import EventsListPage from '@/pages/EventsListPage';
import BlogsListPage from '@/pages/BlogsListPage';
import DonationsListPage from '@/pages/DonationsListPage';
import LoginPage from '@/pages/admin/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import AboutPage from '@/pages/admin/AboutPage';
import DonationsPage from '@/pages/admin/DonationsPage';
import EventsPage from '@/pages/admin/EventsPage';
import BlogsPage from '@/pages/admin/BlogsPage';
import MessagesPage from '@/pages/admin/MessagesPage';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donation/:id" element={<DonationDetailPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/blogs" element={<BlogsListPage />} />
          <Route path="/donations" element={<DonationsListPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/about"
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute>
                <DonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute>
                <BlogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
