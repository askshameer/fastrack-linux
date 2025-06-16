import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Briefcase, FileText, Clock, CheckCircle, XCircle, Upload, Search, Filter, Eye, EyeOff, Menu, X, Home, Users, FileCheck, BarChart3, Settings, LogOut, Timer, Award, TrendingUp, Calendar, Mail, Lock, ArrowRight, Plus, Trash2, Edit, Download, Send, AlertCircle, ChevronDown } from 'lucide-react';

// Type definitions
interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
  availability?: boolean;
}

interface Job {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  createdAt: Date;
}

interface CV {
  id: number;
  userId: number;
  fileName: string;
  skills: string[];
  experience: string;
  uploadedAt: Date;
  availability?: boolean;
}

interface Match {
  matchId: string;
  cvId: number;
  jobId: number;
  percentage: number;
  cv: CV;
  job: Job;
  testEnabled: boolean;
}

interface Test {
  id: number;
  userId: number;
  jobId: number;
  enabled: boolean;
  completed: boolean;
  score: number | null;
  enabledAt: Date;
  completedAt?: Date;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

// Props interfaces
interface LoginPageProps {
  onLogin: (email: string, password: string) => User | undefined;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  calculateMatch: (job: Job, cv: CV) => number;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showNewJobForm: boolean;
  setShowNewJobForm: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  jobs: Job[];
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}

interface JobsSectionProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showNewJobForm: boolean;
  setShowNewJobForm: React.Dispatch<React.SetStateAction<boolean>>;
}

interface JobFormData {
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: string;
}

interface JobEditData extends JobFormData {
  id: number;
}

interface CVsSectionProps {
  cvs: CV[];
}

interface MatchingSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  calculateMatch: (job: Job, cv: CV) => number;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
}

interface CandidatesSectionProps {
  cvs: CV[];
  tests: Test[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
}

interface Candidate extends CV {
  tests: Test[];
}

interface AnalyticsSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  tests: Test[];
}

interface CVSectionProps {
  userCV: CV | undefined;
  uploadingCV: boolean;
  setUploadingCV: React.Dispatch<React.SetStateAction<boolean>>;
  handleCVUpload: () => void;
  availability: boolean;
  onChangeAvailability: (value: boolean) => void;
}

interface TestsSectionProps {
  enabledTests: Test[];
  jobs: Job[];
  handleStartTest: (test: Test) => void;
}

interface ResultsSectionProps {
  userTests: Test[];
  jobs: Job[];
}

interface TestInterfaceProps {
  test: Test;
  questions: Question[];
  onComplete: (score: number) => void;
  onCancel: () => void;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

// Mock data and utilities
const mockUsers: User[] = [
  { id: 1, email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Sarah Johnson' },
  { id: 2, email: 'john@example.com', password: 'user123', role: 'user', name: 'John Doe', availability: true }
];

const mockJobs: Job[] = [
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

const mockCVs: CV[] = [
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

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const mockQuestions: Question[] = [
  { id: 1, question: 'What is React?', options: ['A library', 'A framework', 'A database', 'A language'], correct: 0 },
  { id: 2, question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 1 },
  { id: 3, question: 'Which is a JavaScript framework?', options: ['Python', 'Angular', 'MySQL', 'PHP'], correct: 1 },
  { id: 4, question: 'What is Node.js?', options: ['A database', 'A runtime environment', 'A CSS framework', 'A testing tool'], correct: 1 },
  { id: 5, question: 'What is MongoDB?', options: ['A SQL database', 'A NoSQL database', 'A programming language', 'A web server'], correct: 1 }
];

// Main App Component
export default function RecruitmentSystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'adminDashboard' | 'userDashboard'>('login');
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [cvs, setCvs] = useState<CV[]>(mockCVs);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNewJobForm, setShowNewJobForm] = useState<boolean>(false);

  const handleLogin = (email: string, password: string): User | undefined => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
    }
    return user;
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handlePasswordChange = (userId: number, oldPassword: string, newPassword: string): boolean => {
    // This would call an API in a real application
    alert(`Password change for user ${userId} would be processed here.`);
    return true;
  };

  const calculateMatch = (job: Job, cv: CV): number => {
    if (!cv.skills || !job.requiredSkills) return 0;
    
    // Find matching skills
    const matchingSkills = cv.skills.filter(skill => 
      job.requiredSkills.some(reqSkill => 
        reqSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    // Calculate match percentage based on required skills
    const skillMatch = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
    
    // Consider experience level as a factor
    // This is a simplified approach - in a real app, you'd have more sophisticated matching
    let experienceMatch = 0;
    const cvExp = parseInt(cv.experience);
    const reqExp = parseInt(job.experienceLevel);
    
    if (!isNaN(cvExp) && !isNaN(reqExp)) {
      if (cvExp >= reqExp) {
        experienceMatch = 100; // Full match if candidate meets or exceeds required experience
      } else {
        experienceMatch = Math.round((cvExp / reqExp) * 100); // Partial match based on proportion
      }
    }
    
    // Final match score (70% skills, 30% experience)
    return Math.round((skillMatch * 0.7) + (experienceMatch * 0.3));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentView === 'adminDashboard' && (
        <AdminDashboard 
          user={currentUser}
          onLogout={handleLogout}
          jobs={jobs}
          setJobs={setJobs}
          cvs={cvs}
          setCvs={setCvs}
          matches={matches}
          setMatches={setMatches}
          tests={tests}
          setTests={setTests}
          calculateMatch={calculateMatch}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showNewJobForm={showNewJobForm}
          setShowNewJobForm={setShowNewJobForm}
          onPasswordChange={handlePasswordChange}
        />
      )}
      {currentView === 'userDashboard' && (
        <UserDashboard 
          user={currentUser}
          onLogout={handleLogout}
          jobs={jobs}
          cvs={cvs}
          setCvs={setCvs}
          matches={matches}
          tests={tests}
          setTests={setTests}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onPasswordChange={handlePasswordChange}
        />
      )}
    </div>
  );
}

// Login Component
// Login Component
interface LoginPageProps {
  onLogin: (email: string, password: string) => User | undefined;
}

function LoginPage({ onLogin }: LoginPageProps) {ate('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      const user = onLogin(email, password);
      if (!user) {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your FasTrack account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Demo credentials: admin@company.com / admin123 or john@example.com / user123
            </p>
          </div>
        </div>
      </div>
    </div>
// Admin Dashboard Component
interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  calculateMatch: (job: Job, cv: CV) => number;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showNewJobForm: boolean;
  setShowNewJobForm: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}
  const [activeSection, setActiveSection] = useState('overview');
  
  interface StatItem {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }

  const stats: StatItem[] = [
    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total CVs', value: cvs.length, icon: FileText, color: 'from-purple-500 to-pink-500' },
    { label: 'Matches Found', value: matches.length, icon: FileCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Tests Completed', value: tests.filter(t => t.completed).length, icon: Award, color: 'from-orange-500 to-red-500' }
  ];

  const menuItems = [
  onLogout, 
  jobs, 
  setJobs, 
  cvs, 
  setCvs,
  matches, 
  setMatches, 
  tests, 
  setTests, 
  calculateMatch, 
  sidebarOpen, 
  setSidebarOpen,
  showNewJobForm,
  setShowNewJobForm,
  onPasswordChange
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'cvs' | 'matching' | 'candidates' | 'analytics'>('overview');
}) {
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'jobs', label: 'Job Descriptions', icon: Briefcase },
    { id: 'cvs', label: 'CVs', icon: FileText },
    { id: 'matching', label: 'Matching', icon: FileCheck },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const stats = [
    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total CVs', value: cvs.length, icon: FileText, color: 'from-purple-500 to-pink-500' },
    { label: 'Matches Found', value: matches.length, icon: FileCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Tests Completed', value: tests.filter(t => t.completed).length, icon: Award, color: 'from-orange-500 to-red-500' }
  ];

  const handlePasswordChange = () => {
    if (onPasswordChange) {
      onPasswordChange(user.id, 'currentPassword', 'newPassword');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/50 backdrop-blur-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RecruitHub</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handlePasswordChange}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all mb-2"
            >
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize">{activeSection}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="font-semibold text-white">{user.name}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Jobs</h3>
                  <div className="space-y-3">
                    {jobs.slice(0, 3).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{job.title}</p>
                          <p className="text-sm text-gray-400">{job.experienceLevel}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">Match #{index + 1}</p>
                          <p className="text-sm text-gray-400">{match.percentage}% match</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          match.percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {match.percentage >= 50 ? 'Qualified' : 'Review'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <JobsSection 
// Jobs Section Component
interface JobsSectionProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showNewJobForm: boolean;
  setShowNewJobForm: React.Dispatch<React.SetStateAction<boolean>>;
}

interface JobFormData {
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: string;
}

interface JobEditData extends JobFormData {
  id: number;
}

function JobsSection({ jobs, setJobs, showNewJobForm, setShowNewJobForm }: JobsSectionProps) {
  const [newJob, setNewJob] = useState<JobFormData>({
    title: '',
    description: '',
    requiredSkills: '',
  const handleEditJob = (job: Job) => {
    setEditingJob({
      ...job,
      requiredSkills: job.requiredSkills.join(', ')
    });
    setShowEditForm(true);
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    
    const updatedJob: Job = {
      id: editingJob.id,
      title: editingJob.title,
      description: editingJob.description,
      requiredSkills: editingJob.requiredSkills.split(',').map(s => s.trim()),
      experienceLevel: editingJob.experienceLevel,
      createdAt: jobs.find(j => j.id === editingJob.id)?.createdAt || new Date()
    };
    
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setEditingJob(null);
    setShowEditForm(false);
  };        <CandidatesSection cvs={cvs} setCvs={setCvs} tests={tests} />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsSection jobs={jobs} cvs={cvs} matches={matches} tests={tests} />
          )}
        </main>
      </div>
    </div>
  );
}

// Jobs Section Component
function JobsSection({ jobs, setJobs, showNewJobForm, setShowNewJobForm }) {
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    experienceLevel: ''
  });
  const [editingJob, setEditingJob] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleCreateJob = (e) => {
    e.preventDefault();
    const job = {
      id: jobs.length + 1,
      ...newJob,
      requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()),
      createdAt: new Date()
    };
    setJobs([...jobs, job]);
    setNewJob({ title: '', description: '', requiredSkills: '', experienceLevel: '' });
    setShowNewJobForm(false);
  };

  const handleEditJob = (job) => {
    setEditingJob({
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Job description..."
                required
              />ault();
    const updatedJob = {
      ...editingJob,
      requiredSkills: editingJob.requiredSkills.split(',').map(s => s.trim())
    };
    
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setEditingJob(null);
    setShowEditForm(false);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Job Descriptions</h3>
        <button
          onClick={() => setShowNewJobForm(!showNewJobForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Job</span>
        </button>
      </div>

      {showNewJobForm && (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Create New Job Description</h4>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Senior Full Stack Developer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={editingJob?.title || ''}
                onChange={(e) => editingJob && setEditingJob({ ...editingJob, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills (comma-separated)</label>
              <input
              <textarea
                value={editingJob?.description || ''}
                onChange={(e) => editingJob && setEditingJob({ ...editingJob, description: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <input
                type="text"
                value={editingJob?.requiredSkills || ''}
                onChange={(e) => editingJob && setEditingJob({ ...editingJob, requiredSkills: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5+ years"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                value={editingJob?.experienceLevel || ''}
                onChange={(e) => editingJob && setEditingJob({ ...editingJob, experienceLevel: e.target.value })}
                Create Job
              </button>
              <button
                type="button"
                onClick={() => setShowNewJobForm(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && editingJob && (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Edit Job Description</h4>
          <form onSubmit={handleUpdateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={editingJob.requiredSkills}
                onChange={(e) => setEditingJob({ ...editingJob, requiredSkills: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <input
                type="text"
                value={editingJob.experienceLevel}
                onChange={(e) => setEditingJob({ ...editingJob, experienceLevel: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Update Job
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  setShowEditForm(false);
                }}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-white">{job.title}</h4>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => handleEditJob(job)}
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  onClick={() => handleDeleteJob(job.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 mb-4">{job.description}</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Experience</p>
                  <p className="text-white">{job.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-white">{job.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CVs Section Component
interface CVsSectionProps {
  cvs: CV[];
}

function CVsSection({ cvs }: CVsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Uploaded CVs</h3>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cvs.map(cv => (
          <div key={cv.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{cv.fileName}</h4>
                  <p className="text-sm text-gray-400">Uploaded {cv.uploadedAt.toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Experience</p>
                <p className="text-white">{cv.experience}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Matching Section Component
interface MatchingSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  calculateMatch: (job: Job, cv: CV) => number;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
}

function MatchingSection({ jobs, cvs, matches, setMatches, calculateMatch, tests, setTests }: MatchingSectionProps) {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [matchResults, setMatchResults] = useState<Match[]>([]);
  const [filterAvailable, setFilterAvailable] = useState<boolean>(true);

  const handleRunMatching = () => {
    if (!selectedJob) return;
    
    const job = jobs.find(j => j.id === parseInt(selectedJob));
    if (!job) return;
    
    // Filter CVs based on availability if filterAvailable is true
    const eligibleCVs = filterAvailable 
      ? cvs.filter(cv => cv.availability !== false) 
      : cvs;
    
    const newMatches = eligibleCVs.map(cv => {
      const matchPercentage = calculateMatch(job, cv);
      return {
        matchId: `${job.id}-${cv.id}`,
        cvId: cv.id,
        jobId: job.id,
        percentage: matchPercentage,
        cv,
        job,
        testEnabled: false
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage in descending order
    
    setMatchResults(newMatches);
    
    // Only add to global matches if not already present
    const updatedMatches = [...matches];
    newMatches.forEach(match => {
      const existingMatchIndex = matches.findIndex(m => 
        m.jobId === match.jobId && m.cvId === match.cvId
      );
      
      if (existingMatchIndex === -1) {
        updatedMatches.push(match);
      } else {
        // Update existing match with new percentage
        updatedMatches[existingMatchIndex] = {
          ...updatedMatches[existingMatchIndex],
          percentage: match.percentage
        };
      }
    });
    
    setMatches(updatedMatches);
  };

  const handleEnableTest = (match: Match) => {
    // Check if test is already enabled for this match
    const existingTest = tests.find(t => 
      t.userId === match.cv.userId && t.jobId === match.job.id
    );
    
    if (!existingTest) {
      const newTest: Test = {
        id: tests.length + 1,
        userId: match.cv.userId,
        jobId: match.job.id,
        enabled: true,
        completed: false,
        score: null,
        enabledAt: new Date()
      };
      setTests([...tests, newTest]);
      
      // Update match to indicate test is enabled
      const updatedMatches = matches.map(m => 
        m.cvId === match.cvId && m.jobId === match.jobId
          ? { ...m, testEnabled: true }
          : m
      );
      setMatches(updatedMatches);
      
      // Also update the current matchResults for UI
      const updatedResults = matchResults.map(m => 
        m.cvId === match.cvId && m.jobId === match.jobId
          ? { ...m, testEnabled: true }
          : m
      );
      setMatchResults(updatedResults);
    } else {
      alert('A test for this candidate and job is already enabled.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Run CV Matching</h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Select a job description</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a job description</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="filterAvailable"
              checked={filterAvailable}
              onChange={() => setFilterAvailable(!filterAvailable)}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="filterAvailable" className="text-white">
              Only include available candidates
            </label>
          </div>
          
          <button
            onClick={handleRunMatching}
            disabled={!selectedJob}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Matching
          </button>
        </div>
      </div>

      {matchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Match Results</h3>
            <span className="text-gray-400">{matchResults.length} matches found</span>
          </div>
          
          {matchResults.map((match, index) => {
            const existingTest = tests.find(t => 
              t.userId === match.cv.userId && t.jobId === match.job.id
            );
            
            return (
              <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-full border-4 ${
                        match.percentage >= 50 ? 'border-green-500' : 'border-yellow-500'
                      } flex items-center justify-center`}>
                        <span className={`text-2xl font-bold ${
                          match.percentage >= 50 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {match.percentage}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{match.cv.fileName}</h4>
                      <p className="text-gray-400">Matched with: {match.job.title}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          {match.percentage >= 50 ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-yellow-400" />
                          )}
                          <span className={`text-sm ${
                            match.percentage >= 50 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {match.percentage >= 50 ? 'Qualified for testing' : 'Below threshold'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${match.cv.availability === false ? 'bg-gray-500' : 'bg-green-500'}`}></span>
                          <span className="text-sm text-gray-400">
                            {match.cv.availability === false ? 'Not Available' : 'Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {match.percentage >= 50 && (
                    <button
                      onClick={() => handleEnableTest(match)}
                      disabled={existingTest || match.testEnabled || match.cv.availability === false}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        existingTest || match.testEnabled
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {existingTest || match.testEnabled ? 'Test Enabled' : 'Enable Test'}
                    </button>
                  )}
                </div>
                
                {/* Display matching skills */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {match.cv.skills.filter(skill => 
                      match.job.requiredSkills.some(jobSkill => 
                        jobSkill.toLowerCase() === skill.toLowerCase()
                      )
                    ).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Candidates Section Component
interface CandidatesSectionProps {
  cvs: CV[];
  tests: Test[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
}

interface Candidate extends CV {
  tests: Test[];
}

function CandidatesSection({ cvs, tests, setCvs }: CandidatesSectionProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(cvs.map(cv => ({
    ...cv,
    tests: tests.filter(t => t.userId === cv.userId)
  })));
  
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleUpdateStatus = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowStatusModal(true);
  };

  const toggleCandidateAvailability = (candidateId: number, newAvailability: boolean) => {
    // Update local state
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, availability: newAvailability }
        : candidate
    );
    setCandidates(updatedCandidates);
    
    // Update parent CVs state to keep changes persistent
    setCvs(prevCvs => prevCvs.map(cv =>
      cv.id === candidateId
        ? { ...cv, availability: newAvailability }
        : cv
    ));
    
    setShowStatusModal(false);
  };

  const handleViewProfile = (candidate: Candidate) => {
    alert(`Viewing profile for candidate #${candidate.userId}`);
    // In a real app, this would navigate to a detailed profile view
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Candidates</h3>
      <div className="grid grid-cols-1 gap-6">
        {candidates.map(candidate => (
          <div key={candidate.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-white">Candidate #{candidate.userId}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      candidate.availability ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {candidate.availability ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <p className="text-gray-400">{candidate.fileName}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-400">Experience: {candidate.experience}</span>
                    <span className="text-sm text-gray-400">Tests: {candidate.tests.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  onClick={() => handleViewProfile(candidate)}
                >
                  View Profile
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  onClick={() => handleUpdateStatus(candidate)}
                >
                  Update Status
                </button>
              </div>
            </div>
            {candidate.tests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Test Results</p>
                <div className="space-y-2">
                  {candidate.tests.map(test => (
                    <div key={test.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                      <span className="text-white">Test #{test.id}</span>
                      {test.completed ? (
                        <span className="text-green-400">Score: {test.score}%</span>
                      ) : (
                        <span className="text-yellow-400">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Update Candidate Status</h3>
            <p className="text-gray-300 mb-6">
              Change availability status for Candidate #{selectedCandidate.userId}
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-white mb-3">Availability Status</p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleCandidateAvailability(selectedCandidate.id, !selectedCandidate.availability)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      selectedCandidate.availability ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      selectedCandidate.availability ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                  <span className="text-gray-300">{selectedCandidate.availability ? 'Available' : 'Not Available'}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {selectedCandidate.availability 
                    ? "Candidate's CV is visible in searches and matching" 
                    : "Candidate's CV is hidden from searches and matching"}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => toggleCandidateAvailability(selectedCandidate.id, !selectedCandidate.availability)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Set {selectedCandidate.availability ? 'Unavailable' : 'Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Section Component
interface AnalyticsSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  tests: Test[];
}

function AnalyticsSection({ jobs, cvs, matches, tests }: AnalyticsSectionProps) {
  const analytics = {
    avgMatchRate: matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.percentage, 0) / matches.length) : 0,
    testCompletionRate: tests.length > 0 ? Math.round((tests.filter(t => t.completed).length / tests.length) * 100) : 0,
    avgTestScore: tests.filter(t => t.completed && t.score).length > 0 
      ? Math.round(tests.filter(t => t.completed && t.score).reduce((acc, t) => acc + t.score, 0) / tests.filter(t => t.completed && t.score).length)
      : 0
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Average Match Rate</h4>
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">{analytics.avgMatchRate}%</p>
          <p className="text-sm text-gray-400 mt-2">Across all job matches</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Test Completion Rate</h4>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{analytics.testCompletionRate}%</p>
          <p className="text-sm text-gray-400 mt-2">Of enabled tests completed</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Average Test Score</h4>
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">{analytics.avgTestScore}%</p>
          <p className="text-sm text-gray-400 mt-2">Average score on completed tests</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Performance Trends</h4>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
}

// User Dashboard Component
interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  jobs: Job[];
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}

function UserDashboard({ user, onLogout, jobs, cvs, setCvs, matches, tests, setTests, sidebarOpen, setSidebarOpen, onPasswordChange }: UserDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'cv' | 'tests' | 'results'>('overview');
  const [availability, setAvailability] = useState(user.availability !== undefined ? user.availability : true);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [takingTest, setTakingTest] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);

  interface StatItem {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }

  const stats: StatItem[] = [
    { label: 'Available Jobs', value: jobs.length, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: 'Your CV', value: userCV ? 1 : 0, icon: FileText, color: 'from-purple-500 to-pink-500' },
    { label: 'Potential Matches', value: matches.filter(m => m.cvId === userCV?.id).length, icon: FileCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Tests Available', value: userTests.filter(t => t.enabled && !t.completed).length, icon: Award, color: 'from-orange-500 to-red-500' }
  ];

  const userCV = cvs.find(cv => cv.userId === user.id);
  const userTests = tests.filter(t => t.userId === user.id);
  const enabledTests = userTests.filter(t => t.enabled && !t.completed);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'cv', label: 'My CV', icon: FileText },
    { id: 'tests', label: 'Tests', icon: FileCheck },
    { id: 'results', label: 'Results', icon: Award }
  ];

  const handleCVUpload = () => {
    // Simulate CV upload
    const newCV = {
      id: cvs.length + 1,
      userId: user.id,
      fileName: 'my_resume.pdf',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: '3 years',
      uploadedAt: new Date(),
      availability: availability
    };
    setCvs([...cvs, newCV]);
    setUploadingCV(false);
  };

  const handleStartTest = (test) => {
    setCurrentTest(test);
    setTakingTest(true);
  };

  const handleChangeAvailability = (newAvailability) => {
    setAvailability(newAvailability);
    // Update CV availability if it exists
    if (userCV) {
      const updatedCVs = cvs.map(cv => 
        cv.userId === user.id ? { ...cv, availability: newAvailability } : cv
      );
      setCvs(updatedCVs);
    }
  };

  const handlePasswordChange = () => {
    // In a real application, this would open a dialog to change password
    alert('Password change functionality would be implemented here.');
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/50 backdrop-blur-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RecruitHub</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handlePasswordChange}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all mb-2"
            >
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize">{activeSection}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Availability:</span>
                <button
                  onClick={() => handleChangeAvailability(!availability)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    availability ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    availability ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="font-semibold text-white">{user.name}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Jobs</h3>
                  <div className="space-y-3">
                    {jobs.slice(0, 3).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{job.title}</p>
                          <p className="text-sm text-gray-400">{job.experienceLevel}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">Match #{index + 1}</p>
                          <p className="text-sm text-gray-400">{match.percentage}% match</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          match.percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {match.percentage >= 50 ? 'Qualified' : 'Review'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <JobsSection 
              jobs={jobs} 
              setJobs={setJobs} 
              showNewJobForm={showNewJobForm} 
              setShowNewJobForm={setShowNewJobForm} 
            />
          )}

          {activeSection === 'cvs' && (
            <CVsSection cvs={cvs} />
          )}

          {activeSection === 'matching' && (
            <MatchingSection 
              jobs={jobs} 
              cvs={cvs} 
              matches={matches} 
              setMatches={setMatches}
              calculateMatch={calculateMatch}
              tests={tests}
              setTests={setTests}
            />
          )}

          {activeSection === 'candidates' && (
            <CandidatesSection cvs={cvs} setCvs={setCvs} tests={tests} />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsSection jobs={jobs} cvs={cvs} matches={matches} tests={tests} />
          )}
        </main>
      </div>
    </div>
  );
}

// CV Section Component
interface CVSectionProps {
  userCV: CV | undefined;
  uploadingCV: boolean;
  setUploadingCV: React.Dispatch<React.SetStateAction<boolean>>;
  handleCVUpload: () => void;
  availability: boolean;
  onChangeAvailability: (value: boolean) => void;
}

function CVSection({ userCV, uploadingCV, setUploadingCV, handleCVUpload, availability, onChangeAvailability }: CVSectionProps) {
  return (
    <div className="space-y-6">
      {!userCV ? (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Your CV</h3>
          <p className="text-gray-400 mb-6">Upload your CV to get matched with relevant job opportunities</p>
          <button
            onClick={() => setUploadingCV(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upload CV
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Your CV</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  availability ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {availability ? 'Available to Recruiters' : 'Hidden from Recruiters'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="font-medium text-white">{userCV.fileName}</p>
                    <p className="text-sm text-gray-400">Uploaded {userCV.uploadedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-3">Extracted Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {userCV.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Experience</p>
                    <p className="text-white">{userCV.experience}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button 
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    onClick={() => setUploadingCV(true)}
                  >
                    Update CV
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      availability 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                    onClick={() => onChangeAvailability(!availability)}
                  >
                    {availability ? (
                      <>
                        <EyeOff className="w-5 h-5" />
                        <span>Make Private</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        <span>Make Available</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">CV Visibility</h3>
            <p className="text-gray-300 mb-4">
              {availability 
                ? 'Your CV is visible to recruiters. They can match it with job descriptions and contact you for opportunities.' 
                : 'Your CV is currently hidden from recruiters. To be considered for opportunities, set your availability to visible.'}
            </p>
            <div className="flex items-center space-x-3">
              <span className="text-white">CV Visibility:</span>
              <button
                onClick={() => onChangeAvailability(!availability)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  availability ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  availability ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-gray-400">
                {availability ? 'Visible to Recruiters' : 'Hidden from Recruiters'}
              </span>
            </div>
          </div>
        </div>
      )}

      {uploadingCV && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Upload CV</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">Drag and drop your CV here</p>
              <p className="text-sm text-gray-400 mb-4">or</p>
              <button
                onClick={handleCVUpload}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Browse Files
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setUploadingCV(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tests Section Component
interface TestsSectionProps {
  enabledTests: Test[];
  jobs: Job[];
  handleStartTest: (test: Test) => void;
}

function TestsSection({ enabledTests, jobs, handleStartTest }: TestsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Available Tests</h3>
      {enabledTests.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 text-center">
          <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Tests Available</h3>
          <p className="text-gray-400">You don't have any tests available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enabledTests.map(test => {
            const job = jobs.find(j => j.id === test.jobId);
            return (

              <div key={test.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-2">{job?.title || 'Assessment'}</h4>
                  <p className="text-gray-400 text-sm">{job?.description}</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span>Duration: 20 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <FileText className="w-5 h-5" />
                    <span>Questions: 25</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <AlertCircle className="w-5 h-5" />
                    <span>No retakes allowed</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest(test)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Start Test
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Results Section Component
interface ResultsSectionProps {
  userTests: Test[];
  jobs: Job[];
}

function ResultsSection({ userTests, jobs }: ResultsSectionProps) {
  const completedTests = userTests.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Test Results</h3>
      {completedTests.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
          <p className="text-gray-400">Complete tests to see your results here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedTests.map(test => {
            const job = jobs.find(j => j.id === test.jobId);
            return (
              <div key={test.id} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{job?.title || 'Assessment'}</h4>
                    <p className="text-sm text-gray-400">Completed {test.completedAt?.toLocaleDateString() || 'Recently'}</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full border-4 ${
                      test.score >= 70 ? 'border-green-500' : test.score >= 50 ? 'border-yellow-500' : 'border-red-500'
                    } flex items-center justify-center`}>
                      <span className={`text-2xl font-bold ${
                        test.score >= 70 ? 'text-green-400' : test.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {test.score}%
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${
                      test.score >= 70 ? 'text-green-400' : test.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {test.score >= 70 ? 'Passed' : test.score >= 50 ? 'Average' : 'Below Average'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Test Interface Component
interface TestInterfaceProps {
  test: Test;
  questions: Question[];
  onComplete: (score: number) => void;
  onCancel: () => void;
}

function TestInterface({ test, questions, onComplete, onCancel }: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate score
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    
    onComplete(score);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionIdx, answerIdx) => {
    setAnswers({ ...answers, [questionIdx]: answerIdx });
  };

  // Take only 5 questions for demo
  const testQuestions = questions.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Assessment in Progress</h3>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              timeLeft < 120 ? 'bg-red-500/20 text-red-400' : 'bg-gray-600 text-white'
            }`}>
              <Timer className="w-5 h-5" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {testQuestions.length}
              </span>
              <div className="flex space-x-1">
                {testQuestions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      answers[idx] !== undefined
                        ? 'bg-purple-500'
                        : idx === currentQuestion
                        ? 'bg-white'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h4 className="text-xl font-medium text-white mb-6">
              {testQuestions[currentQuestion].question}
            </h4>
            <div className="space-y-3">
              {testQuestions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQuestion, idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    answers[currentQuestion] === idx
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === idx
                        ? 'border-purple-500'
                        : 'border-gray-500'
                    }`}>
                      {answers[currentQuestion] === idx && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-gray-400">
            {Object.keys(answers).length} of {testQuestions.length} answered
          </span>

          {currentQuestion === testQuestions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < testQuestions.length}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(testQuestions.length - 1, currentQuestion + 1))}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}