// BideyaBoost V2 TypeScript Types

export interface Student {
  id: string;
  name: string;
  email: string;
  bacSection: string;
  grades: Record<string, number>;
  average: number;
  personalityTraits?: PersonalityTrait[];
  createdAt: Date;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
}

export interface University {
  id: string;
  name: string;
  region: string;
  domains: string[];
  admissionConditions: AdmissionCondition[];
  description: string;
  image?: string;
}

export interface Major {
  id: string;
  name: string;
  domain: string;
  duration: number;
  universities: string[];
  careerOpportunities: string[];
  description: string;
}

export interface AdmissionCondition {
  bacSection: string;
  minimumAverage: number;
  requiredSubjects: string[];
  additionalRequirements?: string[];
}

export interface CareerOpportunity {
  id: string;
  title: string;
  domain: string;
  averageSalary: string;
  growthRate: number;
  description: string;
  requiredSkills: string[];
}

export interface OrientationRecommendation {
  id: string;
  university: University;
  major: Major;
  matchScore: number;
  successProbability: number;
  reasoning: string;
  careerOpportunities: CareerOpportunity[];
  ranking: number;
}

export interface PsychometricTest {
  id: string;
  questions: TestQuestion[];
  progress: number;
  completed: boolean;
  results?: TestResult;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: TestOption[];
  category: string;
}

export interface TestOption {
  id: string;
  text: string;
  score: number;
}

export interface TestResult {
  personalityType: string;
  dominantTraits: PersonalityTrait[];
  suitableDomains: string[];
  suggestedCareers: string[];
  summary: string;
}

export interface OrientationScore {
  studentId: string;
  scores: Record<string, number>;
  breakdown: ScoreBreakdown[];
  totalScore: number;
  ranking: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  weight: number;
  description: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
