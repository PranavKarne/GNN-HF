import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="section-padding">
      <div className="container-narrow prose prose-gray max-w-none">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="heading-lg mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: January 2024</p>
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly, including account details and uploaded ECG images for analysis purposes.</p>
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Information</h2>
          <p>Your data is used solely for providing ECG analysis services and improving our AI models. We never sell personal data.</p>
          <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
          <p>We implement industry-standard security measures including encryption, access controls, and regular security audits.</p>
          <h2 className="text-xl font-semibold text-foreground">4. HIPAA Compliance</h2>
          <p>GNN-HF is fully HIPAA compliant. We maintain Business Associate Agreements with all relevant parties.</p>
        </div>
      </div>
    </div>
  );
}
