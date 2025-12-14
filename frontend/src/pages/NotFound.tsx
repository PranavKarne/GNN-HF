import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary-light/10 to-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative inline-block mb-8">
          <Heart className="w-24 h-24 text-primary/20" />
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="hero" asChild>
          <Link to="/"><Home className="w-4 h-4" />Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
