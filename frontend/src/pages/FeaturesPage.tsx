import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Brain, FileHeart, Shield, BarChart3, Clock, Users } from "lucide-react";

const features = [
  { icon: Brain, title: "GNN-Powered Analysis", desc: "Advanced Graph Neural Networks analyze ECG patterns with clinical-grade accuracy, identifying subtle indicators of heart failure." },
  { icon: FileHeart, title: "ECG Image Processing", desc: "Simply upload ECG images—no signal data required. Our AI extracts key cardiac features automatically." },
  { icon: Shield, title: "HIPAA Compliant", desc: "Enterprise-grade security with full HIPAA compliance ensures patient data protection at every step." },
  { icon: BarChart3, title: "Explainable AI", desc: "Understand the reasoning behind every prediction with transparent, clinician-friendly insights." },
  { icon: Clock, title: "Instant Results", desc: "Get comprehensive risk assessments in seconds, enabling faster clinical decision-making." },
  { icon: Users, title: "Patient Management", desc: "Organize patient records, track analysis history, and manage reports in one unified platform." }
];

export default function FeaturesPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h1 className="heading-lg mb-4">Powerful Tools for <span className="gradient-text">Modern Cardiology</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to analyze ECGs, manage patients, and make informed clinical decisions.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card variant="feature" className="h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
