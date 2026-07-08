export type LabMode = "css" | "js";

export type CodePracticeFiles = {
  html: string;
  css: string;
  js: string;
};

export type CodePracticeQuestion = {
  id: string;
  title: string;
  description: string;
  points: number;
  files: CodePracticeFiles;
  editable: LabMode;
  starter: string;
  checker: string;
};

export type CodePracticeSet = {
  id: string;
  mode: LabMode;
  title: string;
  description: string;
  questions: CodePracticeQuestion[];
};

export type CheckerResult = {
  pass: boolean;
  message: string;
};
