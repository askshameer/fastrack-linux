// Type definitions
export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
  availability?: boolean;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  createdAt: Date;
}

export interface CV {
  id: number;
  userId: number;
  fileName: string;
  skills: string[];
  experience: string;
  uploadedAt: Date;
  availability?: boolean;
}

export interface Match {
  matchId: string;
  cvId: number;
  jobId: number;
  percentage: number;
  cv: CV;
  job: Job;
  testEnabled: boolean;
}

export interface Test {
  id: number;
  userId: number;
  jobId: number;
  enabled: boolean;
  completed: boolean;
  score: number | null;
  enabledAt: Date;
  completedAt?: Date;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

// Mock data 
export const mockUsers: User[] = [
  { id: 1, email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Sarah Johnson' },
  { id: 2, email: 'john@example.com', password: 'user123', role: 'user', name: 'John Doe', availability: true }
];

export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced full stack developer to join our team.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    experienceLevel: '5+ years',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    description: 'Creative designer needed for our product team.',
    requiredSkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    experienceLevel: '3+ years',
    createdAt: new Date('2024-01-20')
  }
];

export const mockCVs: CV[] = [
  {
    id: 1,
    userId: 2,
    fileName: 'john_doe_resume.pdf',
    skills: ['React', 'JavaScript', 'Node.js', 'CSS'],
    experience: '4 years',
    uploadedAt: new Date('2024-01-18'),
    availability: true
  }
];

export const mockQuestions: Question[] = [
  { id: 1, question: 'What is React?', options: ['A library', 'A framework', 'A database', 'A language'], correct: 0 },
  { id: 2, question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 1 },
  { id: 3, question: 'Which is a JavaScript framework?', options: ['Python', 'Angular', 'MySQL', 'PHP'], correct: 1 },
  { id: 4, question: 'What is Node.js?', options: ['A database', 'A runtime environment', 'A CSS framework', 'A testing tool'], correct: 1 },
  { id: 5, question: 'What is MongoDB?', options: ['A SQL database', 'A NoSQL database', 'A programming language', 'A web server'], correct: 1 }
];
