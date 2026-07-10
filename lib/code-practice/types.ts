export type LabMode = "css" | "js";

export type CodePracticeFiles = {
  html: string;
  css: string;
  js: string;
};

export type CodePracticeCheck = {
  label: string;
  points: number;
  checker: string;
};

export type CodePracticeQuestion = {
  id: string;
  title: string;
  description: string;
  files: CodePracticeFiles;
  editable: LabMode;
  starter: string;
  checks: CodePracticeCheck[];
};

export type CodePracticeSet = {
  id: string;
  mode: LabMode;
  title: string;
  description: string;
  questions: CodePracticeQuestion[];
};

export type CheckResult = {
  label: string;
  points: number;
  pass: boolean;
  message: string;
};

export function questionPoints(question: CodePracticeQuestion): number {
  return question.checks.reduce((sum, c) => sum + c.points, 0);
}
