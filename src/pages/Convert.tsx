import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mail, GraduationCap, FileUp, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Upload, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { extractPercentagesFromPDF } from "@/lib/pdf-extractor";

const ghanaUniversities = [
  "University of Ghana",
  "Kwame Nkrumah University of Science and Technology",
  "University of Cape Coast",
  "University of Education, Winneba",
  "Ghana Institute of Management and Public Administration",
  "Ashesi University",
  "Central University",
  "Valley View University",
  "Methodist University College Ghana",
  "Pentecost University",
  "Accra Technical University",
  "Kumasi Technical University",
  "Ho Technical University",
  "Koforidua Technical University",
  "Other (Ghana)",
];

const otherUniversities = [
  "University of Lagos (Nigeria)",
  "University of Nairobi (Kenya)",
  "University of Cape Town (South Africa)",
  "Makerere University (Uganda)",
  "University of Dar es Salaam (Tanzania)",
  "Other International University",
];

interface GradeResult {
  percentage: number;
  gpa: number;
  letterGrade: string;
}

// Convert percentage to US GPA using standard scale
const percentageToGPA = (percentage: number): { gpa: number; letterGrade: string } => {
  if (percentage >= 93) return { gpa: 4.0, letterGrade: "A" };
  if (percentage >= 90) return { gpa: 3.7, letterGrade: "A-" };
  if (percentage >= 87) return { gpa: 3.3, letterGrade: "B+" };
  if (percentage >= 83) return { gpa: 3.0, letterGrade: "B" };
  if (percentage >= 80) return { gpa: 2.7, letterGrade: "B-" };
  if (percentage >= 77) return { gpa: 2.3, letterGrade: "C+" };
  if (percentage >= 73) return { gpa: 2.0, letterGrade: "C" };
  if (percentage >= 70) return { gpa: 1.7, letterGrade: "C-" };
  if (percentage >= 67) return { gpa: 1.3, letterGrade: "D+" };
  if (percentage >= 63) return { gpa: 1.0, letterGrade: "D" };
  if (percentage >= 60) return { gpa: 0.7, letterGrade: "D-" };
  return { gpa: 0.0, letterGrade: "F" };
};

const Convert = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedGrades, setExtractedGrades] = useState<GradeResult[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const { toast } = useToast();

  const totalSteps = 5;
  const progressPercentage = (step / totalSteps) * 100;

  const stepIcons = [
    { icon: Mail, label: "Email" },
    { icon: GraduationCap, label: "University" },
    { icon: FileUp, label: "Upload" },
    { icon: CreditCard, label: "Payment" },
    { icon: CheckCircle, label: "Results" },
  ];

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setIsProcessing(true);
      
      try {
        const percentages = await extractPercentagesFromPDF(file);
        
        if (percentages.length === 0) {
          toast({
            title: "No grades found",
            description: "Could not find any percentage values in the PDF. Please ensure your transcript contains percentage grades.",
            variant: "destructive",
          });
          setPdfFile(null);
        } else {
          const grades = percentages.map((p) => ({
            percentage: p,
            ...percentageToGPA(p),
          }));
          setExtractedGrades(grades);
          toast({
            title: "PDF processed successfully",
            description: `Found ${percentages.length} grade(s) in your transcript.`,
          });
        }
      } catch (error) {
        console.error("Error processing PDF:", error);
        toast({
          title: "Error processing PDF",
          description: "There was an error reading your PDF. Please try again.",
          variant: "destructive",
        });
        setPdfFile(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaymentProcessing(false);
    setIsPaid(true);
    setStep(5);
    toast({
      title: "Payment successful!",
      description: "Your conversion results are now available.",
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      case 2:
        return university !== "";
      case 3:
        return pdfFile !== null && extractedGrades.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const averageGPA = extractedGrades.length > 0
    ? (extractedGrades.reduce((sum, g) => sum + g.gpa, 0) / extractedGrades.length).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Progress Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepIcons.map((s, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index + 1 <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    index + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : index + 1 === step
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted"
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {step === 1 && "Enter Your Email"}
              {step === 2 && "Select Your University"}
              {step === 3 && "Upload Your Transcript"}
              {step === 4 && "Complete Payment"}
              {step === 5 && "Your Conversion Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  We'll send your conversion results to this email address.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: University */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Select your university to apply the correct grading scale.
                </p>
                <div className="space-y-2">
                  <Label>University</Label>
                  <Select value={university} onValueChange={setUniversity}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header-ghana" disabled>
                        — Ghana —
                      </SelectItem>
                      {ghanaUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                      <SelectItem value="header-other" disabled>
                        — Other Countries —
                      </SelectItem>
                      {otherUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Upload PDF */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Upload your transcript PDF. All processing happens locally in your browser.
                </p>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : pdfFile
                      ? "border-green-500 bg-green-500/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-muted-foreground">Processing your transcript...</p>
                    </div>
                  ) : pdfFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {extractedGrades.length} grade(s) extracted
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <p className="font-medium">
                        {isDragActive
                          ? "Drop your PDF here"
                          : "Drag & drop your transcript PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  )}
                </div>
                {pdfFile && extractedGrades.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Preview (blurred until payment):</p>
                    <div className="blur-sm select-none">
                      <p className="text-lg font-bold">Average GPA: {averageGPA}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">$4.00</p>
                  <p className="text-muted-foreground">One-time payment</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Complete GPA conversion report</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>WES-consistent methodology</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Downloadable results</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Email delivery included</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isPaymentProcessing}
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay $4.00
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  This is a demo. No real payment will be processed.
                </p>
              </div>
            )}

            {/* Step 5: Results */}
            {step === 5 && isPaid && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Cumulative GPA</p>
                  <p className="text-5xl font-bold text-primary">{averageGPA}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    on a 4.0 US scale
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Grade Breakdown</h3>
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted font-medium text-sm">
                      <span>Percentage</span>
                      <span>GPA</span>
                      <span>Grade</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {extractedGrades.map((grade, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 p-3 border-t border-muted text-sm"
                        >
                          <span>{grade.percentage.toFixed(1)}%</span>
                          <span className="font-medium">{grade.gpa.toFixed(1)}</span>
                          <span>{grade.letterGrade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full">
                    Download Report (PDF)
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Results have been sent to {email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < 4 && (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className={step === 1 ? "w-full" : "flex-1"}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Convert;
