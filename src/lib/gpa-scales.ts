// GPA conversion scales for different evaluation systems

export type ConversionType = 'wes' | 'us_4' | 'uk' | 'canada' | 'germany';

export interface ConversionScale {
  id: ConversionType;
  name: string;
  description: string;
  maxGpa: number;
}

export const conversionScales: ConversionScale[] = [
  { id: 'wes', name: 'WES Evaluation', description: 'World Education Services standard', maxGpa: 4.0 },
  { id: 'us_4', name: 'US 4.0 Scale', description: 'Standard American GPA scale', maxGpa: 4.0 },
  { id: 'uk', name: 'UK Classification', description: 'British honours degree system', maxGpa: 4.0 },
  { id: 'canada', name: 'Canadian Scale', description: 'Canadian GPA system', maxGpa: 4.0 },
  { id: 'germany', name: 'German Scale', description: 'German grading (1.0-5.0)', maxGpa: 1.0 },
];

export interface GradeResult {
  courseName: string;
  percentage: number;
  gpa: number;
  letterGrade: string;
  explanation: string;
}

// WES/US 4.0 Scale (standard American)
const convertToUS = (percentage: number): { gpa: number; letterGrade: string; explanation: string } => {
  if (percentage >= 93) return { gpa: 4.0, letterGrade: "A", explanation: "Excellent - top tier performance (93-100%)" };
  if (percentage >= 90) return { gpa: 3.7, letterGrade: "A-", explanation: "Excellent - high achievement (90-92%)" };
  if (percentage >= 87) return { gpa: 3.3, letterGrade: "B+", explanation: "Very Good - above average (87-89%)" };
  if (percentage >= 83) return { gpa: 3.0, letterGrade: "B", explanation: "Good - solid performance (83-86%)" };
  if (percentage >= 80) return { gpa: 2.7, letterGrade: "B-", explanation: "Good - meets expectations (80-82%)" };
  if (percentage >= 77) return { gpa: 2.3, letterGrade: "C+", explanation: "Satisfactory - above minimum (77-79%)" };
  if (percentage >= 73) return { gpa: 2.0, letterGrade: "C", explanation: "Satisfactory - acceptable (73-76%)" };
  if (percentage >= 70) return { gpa: 1.7, letterGrade: "C-", explanation: "Below Average - minimum pass (70-72%)" };
  if (percentage >= 67) return { gpa: 1.3, letterGrade: "D+", explanation: "Poor - barely passing (67-69%)" };
  if (percentage >= 63) return { gpa: 1.0, letterGrade: "D", explanation: "Poor - marginal pass (63-66%)" };
  if (percentage >= 60) return { gpa: 0.7, letterGrade: "D-", explanation: "Very Poor - lowest passing (60-62%)" };
  return { gpa: 0.0, letterGrade: "F", explanation: "Failing - below minimum requirements (<60%)" };
};

// UK Classification
const convertToUK = (percentage: number): { gpa: number; letterGrade: string; explanation: string } => {
  if (percentage >= 70) return { gpa: 4.0, letterGrade: "First", explanation: "First Class Honours - exceptional (70%+)" };
  if (percentage >= 60) return { gpa: 3.3, letterGrade: "2:1", explanation: "Upper Second Class Honours (60-69%)" };
  if (percentage >= 50) return { gpa: 2.7, letterGrade: "2:2", explanation: "Lower Second Class Honours (50-59%)" };
  if (percentage >= 40) return { gpa: 2.0, letterGrade: "Third", explanation: "Third Class Honours - pass (40-49%)" };
  return { gpa: 0.0, letterGrade: "Fail", explanation: "Below pass threshold (<40%)" };
};

// Canadian Scale
const convertToCanada = (percentage: number): { gpa: number; letterGrade: string; explanation: string } => {
  if (percentage >= 90) return { gpa: 4.0, letterGrade: "A+", explanation: "Outstanding achievement (90-100%)" };
  if (percentage >= 85) return { gpa: 4.0, letterGrade: "A", explanation: "Excellent achievement (85-89%)" };
  if (percentage >= 80) return { gpa: 3.7, letterGrade: "A-", explanation: "High achievement (80-84%)" };
  if (percentage >= 77) return { gpa: 3.3, letterGrade: "B+", explanation: "Very good (77-79%)" };
  if (percentage >= 73) return { gpa: 3.0, letterGrade: "B", explanation: "Good performance (73-76%)" };
  if (percentage >= 70) return { gpa: 2.7, letterGrade: "B-", explanation: "Above average (70-72%)" };
  if (percentage >= 67) return { gpa: 2.3, letterGrade: "C+", explanation: "Average (67-69%)" };
  if (percentage >= 63) return { gpa: 2.0, letterGrade: "C", explanation: "Satisfactory (63-66%)" };
  if (percentage >= 60) return { gpa: 1.7, letterGrade: "C-", explanation: "Marginal (60-62%)" };
  if (percentage >= 50) return { gpa: 1.0, letterGrade: "D", explanation: "Minimum pass (50-59%)" };
  return { gpa: 0.0, letterGrade: "F", explanation: "Failing (<50%)" };
};

// German Scale (inverted - 1.0 is best)
const convertToGermany = (percentage: number): { gpa: number; letterGrade: string; explanation: string } => {
  if (percentage >= 90) return { gpa: 1.0, letterGrade: "1.0", explanation: "Sehr Gut - Excellent (90-100%)" };
  if (percentage >= 85) return { gpa: 1.3, letterGrade: "1.3", explanation: "Sehr Gut - Very Good (85-89%)" };
  if (percentage >= 80) return { gpa: 1.7, letterGrade: "1.7", explanation: "Gut - Good (80-84%)" };
  if (percentage >= 75) return { gpa: 2.0, letterGrade: "2.0", explanation: "Gut - Good (75-79%)" };
  if (percentage >= 70) return { gpa: 2.3, letterGrade: "2.3", explanation: "Gut - Satisfactory (70-74%)" };
  if (percentage >= 65) return { gpa: 2.7, letterGrade: "2.7", explanation: "Befriedigend - Satisfactory (65-69%)" };
  if (percentage >= 60) return { gpa: 3.0, letterGrade: "3.0", explanation: "Befriedigend - Fair (60-64%)" };
  if (percentage >= 55) return { gpa: 3.3, letterGrade: "3.3", explanation: "Ausreichend - Adequate (55-59%)" };
  if (percentage >= 50) return { gpa: 3.7, letterGrade: "3.7", explanation: "Ausreichend - Sufficient (50-54%)" };
  if (percentage >= 40) return { gpa: 4.0, letterGrade: "4.0", explanation: "Ausreichend - Pass (40-49%)" };
  return { gpa: 5.0, letterGrade: "5.0", explanation: "Nicht Bestanden - Fail (<40%)" };
};

export const convertPercentage = (
  percentage: number,
  scaleType: ConversionType,
  courseName: string = `Course ${Math.floor(Math.random() * 100)}`
): GradeResult => {
  let result;
  
  switch (scaleType) {
    case 'wes':
    case 'us_4':
      result = convertToUS(percentage);
      break;
    case 'uk':
      result = convertToUK(percentage);
      break;
    case 'canada':
      result = convertToCanada(percentage);
      break;
    case 'germany':
      result = convertToGermany(percentage);
      break;
    default:
      result = convertToUS(percentage);
  }
  
  return {
    courseName,
    percentage,
    ...result,
  };
};

export const calculateAverageGPA = (grades: GradeResult[], scaleType: ConversionType): number => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.gpa, 0);
  return sum / grades.length;
};

export const getGPAStrength = (gpa: number, scaleType: ConversionType): { level: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'; label: string; color: string } => {
  // Handle German scale (inverted)
  if (scaleType === 'germany') {
    if (gpa <= 1.5) return { level: 'excellent', label: 'Excellent', color: 'text-green-600' };
    if (gpa <= 2.5) return { level: 'good', label: 'Good', color: 'text-blue-600' };
    if (gpa <= 3.5) return { level: 'average', label: 'Satisfactory', color: 'text-yellow-600' };
    if (gpa <= 4.0) return { level: 'below_average', label: 'Adequate', color: 'text-orange-600' };
    return { level: 'poor', label: 'Failing', color: 'text-destructive' };
  }
  
  // Standard 4.0 scale
  if (gpa >= 3.7) return { level: 'excellent', label: 'Excellent', color: 'text-green-600' };
  if (gpa >= 3.0) return { level: 'good', label: 'Good', color: 'text-blue-600' };
  if (gpa >= 2.0) return { level: 'average', label: 'Average', color: 'text-yellow-600' };
  if (gpa >= 1.0) return { level: 'below_average', label: 'Below Average', color: 'text-orange-600' };
  return { level: 'poor', label: 'Poor', color: 'text-destructive' };
};
