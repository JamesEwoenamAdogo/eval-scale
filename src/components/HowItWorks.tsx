import { Upload, Calculator, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Transcript",
    description: "Upload your academic transcript securely. Your data stays on your device and never reaches our servers.",
    step: "01",
  },
  {
    icon: Calculator,
    title: "Automatic Conversion",
    description: "Our algorithm applies WES-consistent conversion methods to calculate your U.S.-equivalent GPA instantly.",
    step: "02",
  },
  {
    icon: Download,
    title: "Get Your Results",
    description: "Review your converted GPA with detailed breakdowns and use it for program planning and eligibility assessment.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to convert your CWA to U.S. GPA
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-accent -z-10" />
              )}
              
              <div className="text-center">
                {/* Step number */}
                <div className="text-6xl font-bold text-primary/20 mb-4">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="inline-flex p-4 rounded-full bg-gradient-primary text-primary-foreground mb-4 shadow-primary">
                  <step.icon className="h-8 w-8" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
