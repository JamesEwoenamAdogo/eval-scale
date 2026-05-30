export interface UniversityRecommendation {
  name: string;
  country: string;
  minGPA: number;
  type: "reach" | "target" | "safety";
  description: string;
}

const universities: UniversityRecommendation[] = [
  // Top tier (3.8+)
  { name: "Harvard University", country: "USA", minGPA: 3.9, type: "reach", description: "Ivy League institution known for excellence across all fields" },
  { name: "Stanford University", country: "USA", minGPA: 3.9, type: "reach", description: "Leading research university in Silicon Valley" },
  { name: "MIT", country: "USA", minGPA: 3.9, type: "reach", description: "World's top engineering and technology institution" },
  { name: "University of Oxford", country: "UK", minGPA: 3.8, type: "reach", description: "Oldest English-speaking university with tutorial system" },
  { name: "University of Cambridge", country: "UK", minGPA: 3.8, type: "reach", description: "World-class research and historic excellence" },
  
  // High tier (3.5-3.8)
  { name: "University of Toronto", country: "Canada", minGPA: 3.6, type: "target", description: "Canada's largest research university" },
  { name: "McGill University", country: "Canada", minGPA: 3.5, type: "target", description: "One of Canada's most prestigious universities" },
  { name: "UCLA", country: "USA", minGPA: 3.7, type: "target", description: "Top public research university in California" },
  { name: "NYU", country: "USA", minGPA: 3.6, type: "target", description: "Global university with strong business and arts programs" },
  { name: "University of Edinburgh", country: "UK", minGPA: 3.5, type: "target", description: "Scotland's leading research university" },
  { name: "Technical University of Munich", country: "Germany", minGPA: 3.5, type: "target", description: "Germany's top technical university" },
  
  // Mid tier (3.0-3.5)
  { name: "University of British Columbia", country: "Canada", minGPA: 3.3, type: "target", description: "Leading Canadian public research university" },
  { name: "Boston University", country: "USA", minGPA: 3.3, type: "target", description: "Private research university with diverse programs" },
  { name: "University of Manchester", country: "UK", minGPA: 3.2, type: "target", description: "Leading Russell Group university" },
  { name: "University of Melbourne", country: "Australia", minGPA: 3.3, type: "target", description: "Australia's top-ranked university" },
  { name: "Heidelberg University", country: "Germany", minGPA: 3.2, type: "target", description: "Germany's oldest university" },
  
  // Accessible tier (2.5-3.0)
  { name: "Arizona State University", country: "USA", minGPA: 2.8, type: "safety", description: "Large public research university with innovation focus" },
  { name: "University of Leeds", country: "UK", minGPA: 2.8, type: "safety", description: "Russell Group university with strong industry links" },
  { name: "Carleton University", country: "Canada", minGPA: 2.7, type: "safety", description: "Comprehensive university in Ottawa" },
  { name: "RWTH Aachen", country: "Germany", minGPA: 2.8, type: "safety", description: "Leading technical university" },
  { name: "University of Sydney", country: "Australia", minGPA: 2.9, type: "safety", description: "Historic Australian research university" },
  
  // More accessible (2.0-2.5)
  { name: "Kent State University", country: "USA", minGPA: 2.5, type: "safety", description: "Public research university in Ohio" },
  { name: "University of Central Lancashire", country: "UK", minGPA: 2.3, type: "safety", description: "Modern university with diverse programs" },
  { name: "Thompson Rivers University", country: "Canada", minGPA: 2.3, type: "safety", description: "Open-enrollment university in British Columbia" },
  { name: "Griffith University", country: "Australia", minGPA: 2.5, type: "safety", description: "Innovative university in Queensland" },
];

export const getUniversityRecommendations = (gpa: number): {
  reach: UniversityRecommendation[];
  target: UniversityRecommendation[];
  safety: UniversityRecommendation[];
} => {
  const reach: UniversityRecommendation[] = [];
  const target: UniversityRecommendation[] = [];
  const safety: UniversityRecommendation[] = [];

  universities.forEach((uni) => {
    if (gpa >= uni.minGPA + 0.3) {
      // GPA is well above minimum - this is a safety school
      safety.push({ ...uni, type: "safety" });
    } else if (gpa >= uni.minGPA - 0.2 && gpa < uni.minGPA + 0.3) {
      // GPA is around the minimum - target school
      target.push({ ...uni, type: "target" });
    } else if (gpa >= uni.minGPA - 0.5) {
      // GPA is below minimum but within reach
      reach.push({ ...uni, type: "reach" });
    }
  });

  // Sort by minGPA descending within each category and limit results
  return {
    reach: reach.sort((a, b) => b.minGPA - a.minGPA).slice(0, 5),
    target: target.sort((a, b) => b.minGPA - a.minGPA).slice(0, 5),
    safety: safety.sort((a, b) => b.minGPA - a.minGPA).slice(0, 5),
  };
};
