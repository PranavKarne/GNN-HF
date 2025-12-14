import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="section-padding">
      <div className="container-narrow">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="heading-lg mb-8">Terms of Service</h1>
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: January 2024</p>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing GNN-HF, you agree to be bound by these Terms of Service and all applicable laws.</p>
          <h2 className="text-xl font-semibold text-foreground">2. Medical Disclaimer</h2>
          <p>GNN-HF is a decision-support tool and does not replace professional medical judgment. Always consult qualified healthcare providers.</p>
          <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
          <h2 className="text-xl font-semibold text-foreground">4. Limitation of Liability</h2>
          <p>GNN-HF shall not be liable for any indirect, incidental, or consequential damages arising from use of the service.</p>
        </div>
      </div>
    </div>
  );
}
