import { Shield, Calculator, Zap, Lock, FileCheck, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calculator,
    title: "WES-Consistent Methodology",
    description: "Our conversion uses methods aligned with World Education Services standards for accurate U.S. GPA equivalents.",
  },
  {
    icon: Lock,
    title: "100% Private & Secure",
    description: "Your transcript never leaves your device. All calculations happen locally in your browser.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get your GPA conversion immediately. No waiting, no complicated forms, no accounts required.",
  },
  {
    icon: FileCheck,
    title: "Multiple Grading Systems",
    description: "Supports various international grading scales and credit systems from universities worldwide.",
  },
  {
    icon: Shield,
    title: "Verified by Design",
    description: "Transparent calculation methods and detailed breakdowns so you understand every step of the process.",
  },
  {
    icon: Globe,
    title: "Planning & Eligibility",
    description: "Gauge program eligibility and compare academic standings before pursuing official evaluations.",
  },
];

const Features = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Why Choose{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Edu Scale
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, accurate, and secure GPA conversion that puts your privacy first
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-card group"
            >
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
