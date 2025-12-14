import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToHomeProps {
  to?: string;
}

export function BackToHome({ to = "/dashboard" }: BackToHomeProps) {
  return (
    <Link to={to}>
      <Button
        variant="outline"
        className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 hover:border-primary/50 transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </Link>
  );
}
