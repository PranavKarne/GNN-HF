import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { BackToHome } from "@/components/BackToHome";
import { API_ENDPOINTS } from "@/config/api";
import { getAuthHeaders } from "@/config/apiUtils";

export default function ProfilePage() {
  const email = localStorage.getItem("email") || "";

  // Personal Info State
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success && data.user.patientInfo) {
        setPatientName(data.user.patientInfo.patientName || "");
        setAge(data.user.patientInfo.age?.toString() || "");
        setGender(data.user.patientInfo.gender || "");
        setContactNumber(data.user.patientInfo.contactNumber || "");
        setSymptoms(data.user.patientInfo.symptoms || "");
        setMedicalHistory(data.user.patientInfo.medicalHistory || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const updateProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      if (!patientName || !age || !gender) {
        setProfileError("Please fill in all required fields");
        setProfileLoading(false);
        return;
      }

      const res = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          patientName,
          age: parseInt(age),
          gender,
          contactNumber,
          symptoms,
          medicalHistory,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProfileSuccess("✅ Profile updated successfully!");
        setTimeout(() => setProfileSuccess(""), 3000);
      } else {
        setProfileError("❌ " + data.message);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setProfileError("Server error. Please try again.");
    }

    setProfileLoading(false);
  };

  const updatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPass || !newPass || !confirmPass) {
      setPasswordError("Please fill all password fields");
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordError("New password & Confirm password do not match");
      return;
    }

    if (newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.UPDATE_PASSWORD, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPasswordSuccess("✅ Password updated successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => setPasswordSuccess(""), 3000);
      } else {
        setPasswordError("❌ " + data.message);
      }
    } catch (error) {
      console.error("Update password error:", error);
      setPasswordError("Server error. Please try again.");
    }

    setPasswordLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>
          <BackToHome />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* PERSONAL INFO */}
        <Card variant="glass">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Success/Error Messages */}
            {profileError && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-600 p-3 rounded-lg border border-green-500/30">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{profileSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Patient Name *</label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                disabled
                className="opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Age *</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Contact Number</label>
              <Input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Current symptoms"
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Medical History</label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Relevant medical history"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <Button
              variant="default"
              className="w-full"
              onClick={updateProfile}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* PASSWORD CHANGE */}
        <Card variant="glass">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Success/Error Messages */}
            {passwordError && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-600 p-3 rounded-lg border border-green-500/30">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={updatePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
