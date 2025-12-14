import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  Activity, 
  LayoutDashboard, 
  Upload, 
  History, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/api";
import { getAuthHeaders } from "@/config/apiUtils";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Data", href: "/dashboard/upload", icon: Upload },
  { name: "Reports & History", href: "/dashboard/history", icon: History },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // -----------------------------
  // ⭐ ROUTE PROTECTION
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
      navigate("/login");
    } else {
      // Load user name from profile
      loadUserName(email);
    }
  }, [navigate]);

  // Load user's name from profile
  const loadUserName = async (email: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success && data.user.patientInfo) {
        const { patientName } = data.user.patientInfo;
        if (patientName) {
          setUserName(patientName);
        } else {
          setUserName(email);
        }
      } else {
        setUserName(email);
      }
    } catch (error) {
      console.error("Error loading user name:", error);
      setUserName(email);
    }
  };

  const userEmail = localStorage.getItem("email") || "User";

  // -----------------------------
  // ⭐ LOGOUT FUNCTION
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("patientId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-background border-r border-border z-40">
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Heart className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
              <Activity className="w-3.5 h-3.5 text-accent absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              GNN-<span className="text-primary">HF</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName || userEmail}</p>
              {userName && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full mt-3 justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 ml-3">
          <Heart className="w-6 h-6 text-primary" />
          <span className="font-bold">GNN-HF</span>
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-background border-r border-border z-50 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <Link to="/" className="flex items-center gap-2.5">
                <Heart className="w-7 h-7 text-primary" />
                <span className="font-bold text-lg">GNN-HF</span>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1.5">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName || userEmail}</p>
                  {userName && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
