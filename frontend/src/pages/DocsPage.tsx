import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Image, Settings } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Documentation</Badge>
          <h1 className="heading-lg mb-4"><span className="gradient-text">User Guide</span></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to get started with GNN-HF.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Upload, title: "Uploading ECG Images", content: "Supported formats: PNG, JPG, JPEG. Max file size: 10MB. Ensure the ECG image is clear and well-lit for best results." },
            { icon: Image, title: "Image Requirements", content: "12-lead ECGs work best. Single-lead ECGs are supported but may have lower accuracy. Avoid blurry or cropped images." },
            { icon: FileText, title: "Understanding Results", content: "Risk scores range from 0-100. Low (0-30), Moderate (31-60), High (61-100). Always consult with a cardiologist for clinical decisions." },
            { icon: Settings, title: "Account Settings", content: "Manage your profile, change password, and configure notification preferences from your dashboard settings." }
          ].map((doc, i) => (
            <motion.div key={doc.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card variant="glass" className="p-6 h-full">
                <doc.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                <p className="text-muted-foreground text-sm">{doc.content}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
