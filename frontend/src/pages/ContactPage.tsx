import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-narrow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Contact</Badge>
          <h1 className="heading-lg mb-4">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Mail, title: "Email", value: "contact@gnn-hf.med" },
            { icon: Phone, title: "Phone", value: "+1 (555) 123-4567" },
            { icon: MapPin, title: "Location", value: "Boston, MA" }
          ].map((item) => (
            <Card key={item.title} variant="glass" className="p-6 text-center">
              <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </Card>
          ))}
        </div>

        <Card variant="glass" className="p-8">
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Your name" />
              <Input type="email" placeholder="Your email" />
            </div>
            <Input placeholder="Subject" />
            <textarea className="w-full h-32 rounded-xl border-2 border-border bg-background px-4 py-3 resize-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none" placeholder="Your message" />
            <Button variant="hero" className="w-full"><Send className="w-4 h-4" />Send Message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
