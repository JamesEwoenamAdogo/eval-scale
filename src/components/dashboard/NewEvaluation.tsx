import { useState } from "react";
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
import { 
  Mail, GraduationCap, FileUp, CreditCard, CheckCircle, 
  ArrowLeft, ArrowRight, Upload, Loader2, Download, Share2, Settings 
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { extractPercentagesFromPDF } from "@/lib/pdf-extractor";
import { 
  conversionScales, 
  ConversionType, 
  convertPercentage, 
  calculateAverageGPA,
  getGPAStrength,
  GradeResult 
} from "@/lib/gpa-scales";
import { useEvaluations } from "@/hooks/use-evaluations";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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

interface NewEvaluationProps {
  onComplete: () => void;
  userEmail?: string;
}

const NewEvaluation = ({ onComplete, userEmail = "" }: NewEvaluationProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(userEmail);
  const [university, setUniversity] = useState("");
  const [conversionType, setConversionType] = useState<ConversionType>("wes");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedGrades, setExtractedGrades] = useState<GradeResult[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();
  const { saveEvaluation } = useEvaluations();

  const totalSteps = 6;
  const progressPercentage = (step / totalSteps) * 100;

  const stepIcons = [
    { icon: Mail, label: "Email" },
    { icon: GraduationCap, label: "University" },
    { icon: FileUp, label: "Upload" },
    { icon: Settings, label: "Scale" },
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
          const grades = percentages.map((p, index) => 
            convertPercentage(p, conversionType, `Course ${index + 1}`)
          );
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

  const handleConversionTypeChange = (value: ConversionType) => {
    setConversionType(value);
    // Recalculate grades with new scale
    if (extractedGrades.length > 0) {
      const newGrades = extractedGrades.map((g, index) => 
        convertPercentage(g.percentage, value, g.courseName)
      );
      setExtractedGrades(newGrades);
    }
  };

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaymentProcessing(false);
    setIsPaid(true);
    
    // Save evaluation
    const avgGPA = calculateAverageGPA(extractedGrades, conversionType);
    const evaluation = saveEvaluation({
      email,
      university,
      conversionType,
      grades: extractedGrades,
      averageGPA: avgGPA,
      isPaid: true,
    });
    
    // Generate share URL
    setShareUrl(`${window.location.origin}/evaluation/${evaluation.id}`);
    
    setStep(6);
    toast({
      title: "Payment successful!",
      description: "Your conversion results are now available.",
    });
  };

  const handleDownload = () => {
    const avgGPA = calculateAverageGPA(extractedGrades, conversionType);
    const scale = conversionScales.find(s => s.id === conversionType);
    
    const content = `
GPA CONVERSION REPORT
=====================
Generated by Edu Scale
Date: ${new Date().toLocaleDateString()}

STUDENT INFORMATION
-------------------
Email: ${email}
University: ${university}
Conversion Scale: ${scale?.name}

CUMULATIVE GPA: ${avgGPA.toFixed(2)}

GRADE BREAKDOWN
---------------
${extractedGrades.map((g, i) => 
  `${i + 1}. ${g.courseName}
     Percentage: ${g.percentage.toFixed(1)}%
     GPA: ${g.gpa.toFixed(2)}
     Grade: ${g.letterGrade}
     Note: ${g.explanation}
`).join('\n')}

---
This report was generated using ${scale?.description}.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPA_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded",
      description: "Your GPA conversion report has been downloaded.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My GPA Conversion Results',
          text: `Check out my GPA conversion: ${calculateAverageGPA(extractedGrades, conversionType).toFixed(2)} on ${conversionScales.find(s => s.id === conversionType)?.name}`,
          url: shareUrl,
        });
      } catch {
        copyShareLink();
      }
    } else {
      copyShareLink();
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
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
        return true; // Conversion type always has default
      case 5:
        return true;
      default:
        return false;
    }
  };

  const averageGPA = extractedGrades.length > 0
    ? calculateAverageGPA(extractedGrades, conversionType)
    : 0;

  const gpaStrength = getGPAStrength(averageGPA, conversionType);
  const currentScale = conversionScales.find(s => s.id === conversionType);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="mb-8">
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
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 && "Enter Your Email"}
            {step === 2 && "Select Your University"}
            {step === 3 && "Upload Your Transcript"}
            {step === 4 && "Choose Conversion Scale"}
            {step === 5 && "Complete Payment"}
            {step === 6 && "Your Conversion Results"}
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
            </div>
          )}

          {/* Step 4: Conversion Type */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                Select the GPA scale you need for your application.
              </p>
              <div className="grid gap-3">
                {conversionScales.map((scale) => (
                  <div
                    key={scale.id}
                    onClick={() => handleConversionTypeChange(scale.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      conversionType === scale.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{scale.name}</p>
                        <p className="text-sm text-muted-foreground">{scale.description}</p>
                      </div>
                      {conversionType === scale.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
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
                  <span>{currentScale?.name} methodology</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Downloadable results</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Shareable link</span>
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

          {/* Step 6: Results */}
          {step === 6 && isPaid && (
            <div className="space-y-6">
              {/* GPA Summary */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Cumulative GPA</p>
                <p className="text-5xl font-bold text-primary">{averageGPA.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  on {currentScale?.name}
                </p>
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background ${gpaStrength.color}`}>
                  <span className="font-medium">{gpaStrength.label}</span>
                </div>
              </div>

              {/* Grade Breakdown Table */}
              <div className="space-y-2">
                <h3 className="font-semibold">Detailed Grade Breakdown</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="hidden md:table-cell">Explanation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedGrades.map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{grade.courseName}</TableCell>
                          <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                          <TableCell className="font-semibold">{grade.gpa.toFixed(2)}</TableCell>
                          <TableCell>{grade.letterGrade}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {grade.explanation}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </Button>
              </div>

              <Button onClick={onComplete} className="w-full">
                View All Evaluations
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Results have been sent to {email}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 6 && (
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
              {step < 5 && (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className={step === 1 ? "w-full" : "flex-1"}
                >
                  {step === 4 ? "Continue to Payment" : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEvaluation;
