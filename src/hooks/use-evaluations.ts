import { useState, useEffect } from 'react';
import { ConversionType, GradeResult } from '@/lib/gpa-scales';

export interface Evaluation {
  id: string;
  email: string;
  university: string;
  conversionType: ConversionType;
  grades: GradeResult[];
  averageGPA: number;
  createdAt: string;
  isPaid: boolean;
}

const STORAGE_KEY = 'edu-scale-evaluations';

export const useEvaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEvaluations(JSON.parse(stored));
      } catch {
        setEvaluations([]);
      }
    }
  }, []);

  const saveEvaluation = (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newEvaluation, ...evaluations];
    setEvaluations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEvaluation;
  };

  const getEvaluation = (id: string) => {
    return evaluations.find(e => e.id === id);
  };

  const getRecentEvaluations = (years: number = 2) => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    return evaluations.filter(e => new Date(e.createdAt) >= cutoffDate);
  };

  const getEvaluationStats = () => {
    const recent = getRecentEvaluations(2);
    const averageGPA = recent.length > 0 
      ? recent.reduce((sum, e) => sum + e.averageGPA, 0) / recent.length 
      : 0;
    
    return {
      totalCount: evaluations.length,
      recentCount: recent.length,
      averageGPA: averageGPA.toFixed(2),
    };
  };

  return {
    evaluations,
    saveEvaluation,
    getEvaluation,
    getRecentEvaluations,
    getEvaluationStats,
  };
};
