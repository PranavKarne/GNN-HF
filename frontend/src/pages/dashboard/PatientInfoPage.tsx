import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, User, Heart, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";

interface PatientForm {
  patientName: string;
  age: string;
  gender: string;
  patientId: string;
  contactNumber: string;
  email: string;
  symptoms: string;
  medicalHistory: string;
}

export default function PatientInfoPage() {
  const userEmail = localStorage.getItem("email") || "";
  const [formData, setFormData] = useState<PatientForm>({
    patientName: "",
    age: "",
    gender: "",
    patientId: "",
    contactNumber: "",
    email: userEmail,
    symptoms: "",
    medicalHistory: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate all required fields
      if (!formData.patientName || !formData.age || !formData.gender || 
          !formData.patientId || !formData.contactNumber || !formData.email || 
          !formData.symptoms || !formData.medicalHistory) {
        setError("All fields are required. Please fill in all information.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(API_ENDPOINTS.PATIENT_INFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          patientName: formData.patientName,
          age: parseInt(formData.age),
          gender: formData.gender,
          patientId: formData.patientId,
          contactNumber: formData.contactNumber,
          patientEmail: formData.email,
          symptoms: formData.symptoms,
          medicalHistory: formData.medicalHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save patient information");
        setIsLoading(false);
        return;
      }

      // Update local storage
      localStorage.setItem("patientInfoCompleted", "true");
      localStorage.setItem("patientId", formData.patientId);

      setSuccess("✅ Patient information saved successfully! Redirecting...");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Patient info error:", error);
      setError("Server error. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Background effects */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <Heart className="w-12 h-12 text-primary fill-primary" />
                <User className="w-6 h-6 text-accent absolute -bottom-1 -right-1" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Patient Information</h2>
            <p className="text-muted-foreground">
              Enter patient details (required)
            </p>
          </div>

          {/* Form Card */}
          <Card variant="glass" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Patient Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient Name *</label>
                <Input
                  type="text"
                  name="patientName"
                  placeholder="Enter full name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Age and Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age *</label>
                  <Input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Patient ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient ID *</label>
                <Input
                  type="text"
                  name="patientId"
                  placeholder="Enter patient ID (e.g., P001, PAT123)"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Number *</label>
                <Input
                  type="tel"
                  name="contactNumber"
                  placeholder="Phone number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Symptoms *</label>
                <textarea
                  name="symptoms"
                  placeholder="Describe symptoms..."
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Medical History *</label>
                <textarea
                  name="medicalHistory"
                  placeholder="Relevant medical history..."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Info Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  ⚠️ All fields are mandatory. Complete this form to access ECG upload and analysis features.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving information...
                  </div>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
