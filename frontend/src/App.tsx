import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import DocsPage from "./pages/DocsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import HistoryPage from "./pages/dashboard/HistoryPage";
import UploadPage from "./pages/dashboard/UploadPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import PatientInfoPage from "./pages/dashboard/PatientInfoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Navigation loading wrapper
const NavigationLoadingWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    setIsLoading(true);
    setNavReady(false);

    const raf = requestAnimationFrame(() => setNavReady(true));
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} isReady={navReady} duration={3000} />;
  }

  return <>{children}</>;
};

const App = () => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [initialReady, setInitialReady] = useState(false);

  const handleInitialLoadComplete = () => {
    setInitialLoad(false);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setInitialReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (initialLoad) {
    return <LoadingScreen onLoadingComplete={handleInitialLoadComplete} isReady={initialReady} duration={3000} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <NavigationLoadingWrapper>
            <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="patient-info" element={<ProtectedRoute><PatientInfoPage /></ProtectedRoute>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </NavigationLoadingWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
