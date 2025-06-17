import React, { useState, useEffect } from 'react';
import { User as UserIcon, Briefcase, FileText, Clock, CheckCircle, XCircle, Upload, Search, Filter, Eye, EyeOff, Menu, X, Home, Users, FileCheck, BarChart3, Settings, LogOut, Timer, Award, TrendingUp, Calendar, Mail, Lock, ArrowRight, Plus, Trash2, Edit, Download, Send, AlertCircle, ChevronDown } from 'lucide-react';
import { User, Job, CV, Match, Test, Question } from './types';
import { demoJobs, demoCVs, demoUsers, demoQuestions } from './data/demoData';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

// Main App Component
const RecruitmentSystem: React.FC = () => {  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'adminDashboard' | 'userDashboard'>('login');
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [cvs, setCvs] = useState<CV[]>(demoCVs);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>(demoQuestions);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNewJobForm, setShowNewJobForm] = useState<boolean>(false);

  // Load session and CV data on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('fastrack_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        const user = users.find(u => u.id === sessionData.userId);
        if (user) {
          setCurrentUser(user);
          setCurrentView(user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('fastrack_session');
      }
    }

    // Load saved CVs
    const savedCVs = localStorage.getItem('fastrack_cvs');
    if (savedCVs) {
      try {
        const parsedCVs = JSON.parse(savedCVs);
        // Merge saved CVs with demo CVs, avoiding duplicates
        const mergedCVs = [...demoCVs];
        parsedCVs.forEach((savedCV: CV) => {
          if (!mergedCVs.some(cv => cv.id === savedCV.id)) {
            mergedCVs.push(savedCV);
          }
        });
        setCvs(mergedCVs);
      } catch (error) {
        console.error('Failed to load saved CVs:', error);
        localStorage.removeItem('fastrack_cvs');
      }
    }

    // Load saved users
    const savedUsers = localStorage.getItem('fastrack_users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        // Merge saved users with demo users, avoiding duplicates
        const mergedUsers = [...demoUsers];
        parsedUsers.forEach((savedUser: User) => {
          if (!mergedUsers.some(user => user.id === savedUser.id)) {
            mergedUsers.push(savedUser);
          }
        });
        setUsers(mergedUsers);
      } catch (error) {
        console.error('Failed to load saved users:', error);
        localStorage.removeItem('fastrack_users');
      }
    }

    // Load saved questions
    const savedQuestions = localStorage.getItem('fastrack_questions');
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        // Merge saved questions with demo questions, avoiding duplicates
        const mergedQuestions = [...demoQuestions];
        parsedQuestions.forEach((savedQuestion: Question) => {
          if (!mergedQuestions.some(q => q.id === savedQuestion.id)) {
            mergedQuestions.push(savedQuestion);
          }
        });
        setQuestions(mergedQuestions);
      } catch (error) {
        console.error('Failed to load saved questions:', error);
        localStorage.removeItem('fastrack_questions');
      }
    }
  }, [users]);

  // Save CVs to localStorage whenever cvs state changes
  useEffect(() => {
    // Only save non-demo CVs (those added by users)
    const userCVs = cvs.filter(cv => cv.id > 6); // demo CVs have IDs 1-6
    if (userCVs.length > 0) {
      localStorage.setItem('fastrack_cvs', JSON.stringify(userCVs));
    }
  }, [cvs]);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    // Only save non-demo users (those created by admin)
    const newUsers = users.filter(user => user.id > 7); // demo users have IDs 1-7
    if (newUsers.length > 0) {
      localStorage.setItem('fastrack_users', JSON.stringify(newUsers));
    }
  }, [users]);

  // Save questions to localStorage whenever questions state changes
  useEffect(() => {
    // Only save non-demo questions (those uploaded by admin)
    const newQuestions = questions.filter(q => q.id > 8); // demo questions have IDs 1-8
    if (newQuestions.length > 0) {
      localStorage.setItem('fastrack_questions', JSON.stringify(newQuestions));
    }
  }, [questions]);

  const handleLogin = (email: string, password: string): User | undefined => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'adminDashboard' : 'userDashboard');
      
      // Save session to localStorage
      localStorage.setItem('fastrack_session', JSON.stringify({
        userId: user.id,
        timestamp: new Date().getTime()
      }));
    }
    return user;
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setCurrentView('login');
    
    // Clear session from localStorage
    localStorage.removeItem('fastrack_session');
  };

  const handlePasswordChange = (userId: number, oldPassword: string, newPassword: string): boolean => {
    // This would call an API in a real application
    alert(`Password change for user ${userId} would be processed here.`);
    return true;
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
          questions={questions}
          setQuestions={setQuestions}
          setUsers={setUsers}
          setCurrentUser={setCurrentUser}
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
          questions={demoQuestions}
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
