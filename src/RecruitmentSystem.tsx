import React, { useState } from 'react';
import { User as UserIcon, Briefcase, FileText, Clock, CheckCircle, XCircle, Upload, Search, Filter, Eye, EyeOff, Menu, X, Home, Users, FileCheck, BarChart3, Settings, LogOut, Timer, Award, TrendingUp, Calendar, Mail, Lock, ArrowRight, Plus, Trash2, Edit, Download, Send, AlertCircle, ChevronDown } from 'lucide-react';
import { User, Job, CV, Match, Test, mockUsers, mockJobs, mockCVs, mockQuestions, Question } from './types';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import { TextMatcher } from './utils/textProcessing';

// Main App Component
const RecruitmentSystem: React.FC = () => {  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'adminDashboard' | 'userDashboard'>('login');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [cvs, setCvs] = useState<CV[]>(mockCVs);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNewJobForm, setShowNewJobForm] = useState<boolean>(false);
  const handleLogin = (email: string, password: string): User | undefined => {
    const user = users.find(u => u.email === email && u.password === password);
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
    
    // Get CV text content, either from the file or construct from skills and experience
    let cvText = '';
    if ((cv as any).fileData) {
      // In a real implementation, you would extract text from the file
      // For demo purposes, we'll construct from skills and experience
      cvText = `CV contains skills: ${cv.skills.join(', ')}. Experience: ${cv.experience}.`;
    } else {
      cvText = `CV contains skills: ${cv.skills.join(', ')}. Experience: ${cv.experience}.`;
    }
    
    // Construct job description text
    const jobText = `Job title: ${job.title}. Description: ${job.description}. Required skills: ${job.requiredSkills.join(', ')}. Experience level: ${job.experienceLevel}.`;
    
    // Use TF-IDF matcher for more accurate matching
    const matcher = new TextMatcher();
    const matchPercentage = matcher.calculateMatchPercentage(jobText, cvText);
    
    // If TF-IDF matching gives too low a score, fall back to basic skill matching
    if (matchPercentage < 20) {
      // Find matching skills
      const matchingSkills = cv.skills.filter(skill => 
        job.requiredSkills.some(reqSkill => 
          reqSkill.toLowerCase() === skill.toLowerCase()
        )
      );
      
      // Calculate match percentage based on required skills
      const skillMatch = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
      
      // Consider experience level as a factor
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
    }
    
    return matchPercentage;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentView === 'adminDashboard' && currentUser && (        <AdminDashboard          user={currentUser}
          users={users}
          onLogout={handleLogout}
          jobs={jobs}
          setJobs={setJobs}
          cvs={cvs}
          setCvs={setCvs}
          matches={matches}
          setMatches={setMatches}
          tests={tests}          setTests={setTests}
          setUsers={setUsers}
          setCurrentUser={setCurrentUser}
          calculateMatch={calculateMatch}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showNewJobForm={showNewJobForm}
          setShowNewJobForm={setShowNewJobForm}
          onPasswordChange={handlePasswordChange}
        />
      )}      {currentView === 'userDashboard' && currentUser && (
        <UserDashboard          user={currentUser}
          users={users}
          setUsers={setUsers}
          setCurrentUser={setCurrentUser}
          onLogout={handleLogout}
          jobs={jobs}
          cvs={cvs}
          setCvs={setCvs}
          matches={matches}
          tests={tests}
          setTests={setTests}
          questions={mockQuestions}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onPasswordChange={handlePasswordChange}
        />
      )}
    </div>
  );
};

interface LoginPageProps {
  onLogin: (email: string, password: string) => User | undefined;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
            </div>            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
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
  );
};

export default RecruitmentSystem;
