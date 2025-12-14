import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What file formats are supported for ECG uploads?", a: "We support PNG, JPG, and JPEG image formats. Simply upload a clear photo or scan of your ECG and our AI will analyze it." },
  { q: "How accurate is the GNN-HF analysis?", a: "Our model achieves 99.2% accuracy in clinical validation studies. However, results should always be reviewed by a qualified healthcare professional." },
  { q: "Is my patient data secure?", a: "Yes, we are fully HIPAA compliant. All data is encrypted in transit and at rest, and we never share patient information with third parties." },
  { q: "How long does an analysis take?", a: "Most analyses complete in under 3 seconds. Complex cases may take slightly longer." },
  { q: "Can I integrate GNN-HF with my existing EHR?", a: "Yes, we offer API integrations with major EHR systems. Contact our team for enterprise solutions." },
  { q: "Is there a free trial available?", a: "Yes, we offer a 14-day free trial with full access to all features. No credit card required." }
];

export default function FAQPage() {
  return (
    <div className="section-padding">
      <div className="container-narrow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h1 className="heading-lg mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
