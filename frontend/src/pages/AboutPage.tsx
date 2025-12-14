import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, Brain, Users, Target, Award, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">About Us</Badge>
          <h1 className="heading-lg mb-4">Advancing Cardiac Care with <span className="gradient-text">AI Innovation</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">GNN-HF combines cutting-edge Graph Neural Networks with clinical expertise to revolutionize heart failure detection.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card variant="feature">
            <Target className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">To make early heart failure detection accessible to every healthcare provider, saving lives through AI-powered diagnostics.</p>
          </Card>
          <Card variant="feature">
            <Award className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-muted-foreground">A world where no heart condition goes undetected, where AI empowers clinicians to provide the best possible care.</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "AI Research", desc: "Published research in leading medical AI journals" },
            { icon: Users, title: "Expert Team", desc: "Cardiologists, AI researchers, and engineers" },
            { icon: BookOpen, title: "Clinical Validation", desc: "Validated across multiple hospital datasets" }
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card variant="glass" className="p-6 text-center">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
