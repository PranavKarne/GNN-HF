import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BackToHome } from "@/components/BackToHome";
import { Heart, Activity, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import heroHeart from "@/assets/hero-heart.png";
import { API_ENDPOINTS } from "@/config/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------
  // UPDATED LOGIN FUNCTION WITH ERROR HANDLING
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Email and password are required");
        setIsLoading(false);
        return;
      }

      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // ⭐ SAVE TOKEN + EMAIL IN LOCAL STORAGE
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("patientId", data.user.patientId);

      setSuccess("Login successful! Redirecting...");

      // ⭐ REDIRECT TO DASHBOARD
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary to-accent overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <img src={heroHeart} alt="Heart visualization" className="max-w-md w-full rounded-2xl shadow-2xl" />
          </motion.div>

          <div className="mt-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Heart Analysis</h2>
            <p className="text-primary-foreground/80 max-w-md">
              Advanced Graph Neural Networks detect heart failure patterns with clinical-grade accuracy.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - LOGIN FORM */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative"
      >
        {/* Back to Home Button - Top Right */}
        <div className="absolute top-6 right-6 z-50">
          <BackToHome to="/" />
        </div>

        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="relative">
              <Heart className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
              <Activity className="w-5 h-5 text-accent absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-2xl tracking-tight">
              GNN-<span className="text-primary">HF</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard and patient data.</p>
          </div>

          <Card variant="glass" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/30"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-green-500/10 text-green-600 p-4 rounded-lg border border-green-500/30"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button variant="hero" size="lg" className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create one here
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
