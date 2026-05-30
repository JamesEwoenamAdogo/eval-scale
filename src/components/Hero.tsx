import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero -z-10" />
      
      {/* Hero image overlay */}
      <div 
        className="absolute inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              WES-Consistent Methodology
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Convert Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              CWA to GPA
            </span>
            {" "}with Confidence
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Estimate your U.S.-equivalent GPA using conversion methods consistent with World Education Services standards. 
            Private, secure, and verified by design.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="group" asChild>
              <Link to="/signup">
                Start Converting
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToHowItWorks}>
              Learn More
            </Button>
          </div>

          {/* Privacy assurance */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>Your transcript never leaves your device</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="hidden sm:inline">100% Private & Secure</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
