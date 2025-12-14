import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroHeart from "@/assets/hero-heart.png";
import {
  Heart,
  Activity,
  Brain,
  FileHeart,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  Clock,
  ChevronRight
} from "lucide-react";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const features = [
  {
    icon: Brain,
    title: "GNN-Powered Analysis",
    description: "Advanced Graph Neural Networks analyze ECG patterns with clinical-grade accuracy."
  },
  {
    icon: FileHeart,
    title: "ECG Image Processing",
    description: "Simply upload ECG images—no signal data required. Our AI extracts key cardiac features."
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with full HIPAA compliance for patient data protection."
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive risk assessments in seconds, not hours."
  },
  {
    icon: BarChart3,
    title: "Explainable AI",
    description: "Understand the 'why' behind every prediction with transparent AI insights."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Cloud-based platform accessible anytime, anywhere, on any device."
  }
];

const steps = [
  { step: "01", title: "Upload ECG Image", description: "Simply drag and drop or select your ECG image file." },
  { step: "02", title: "AI Analysis", description: "Our GNN model processes the image and extracts cardiac features." },
  { step: "03", title: "Get Results", description: "Receive detailed risk assessment with confidence scores." },
  { step: "04", title: "Take Action", description: "Review recommendations and share reports with patients." }
];

const stats = [
  { value: "99.2%", label: "Accuracy Rate" },
  { value: "50K+", label: "ECGs Analyzed" },
  { value: "2.3s", label: "Avg. Analysis Time" },
  { value: "500+", label: "Active Clinicians" }
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary-light/20 to-background" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              <motion.div custom={0} variants={fadeUpVariants}>
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  AI-Powered Cardiac Analysis
                </Badge>
              </motion.div>

              <motion.h1 custom={1} variants={fadeUpVariants} className="heading-xl mb-6">
                Detect Heart Failure with{" "}
                <span className="gradient-text">Graph Neural Networks</span>
              </motion.h1>

              <motion.p custom={2} variants={fadeUpVariants} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Transform ECG images into actionable insights. Our advanced GNN technology 
                helps clinicians identify heart failure risk with unprecedented accuracy.
              </motion.p>

              <motion.div custom={3} variants={fadeUpVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/docs">
                    View Documentation
                  </Link>
                </Button>
              </motion.div>

              <motion.div custom={4} variants={fadeUpVariants} className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> clinicians trust GNN-HF
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={heroHeart} 
                  alt="AI-powered heart analysis visualization" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-4 top-1/4 glass-card p-4 shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-risk-low/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-risk-low" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <p className="font-semibold text-risk-low">Low</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -right-4 bottom-1/4 glass-card p-4 shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-semibold">98.5%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="heading-lg mb-4">
              Why Choose <span className="gradient-text">GNN-HF</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built by cardiologists and AI researchers, GNN-HF combines cutting-edge 
              technology with clinical expertise.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card variant="feature" className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="heading-lg mb-4">
              Simple, Fast, <span className="gradient-text">Accurate</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get from ECG image to actionable insights in four simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <Card variant="glass" className="p-6 h-full">
                  <span className="text-5xl font-bold text-primary/10 absolute top-4 right-4">{step.step}</span>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </Card>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            
            <div className="relative z-10 p-12 lg:p-16 text-center text-primary-foreground">
              <Heart className="w-12 h-12 mx-auto mb-6 animate-heart-beat" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join hundreds of clinicians using GNN-HF to detect heart failure earlier 
                and improve patient outcomes.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="secondary" size="xl" asChild>
                  <Link to="/dashboard">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20" asChild>
                  <Link to="/contact">
                    Request Demo
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
