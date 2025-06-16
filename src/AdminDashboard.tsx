import React, { useState } from 'react';
import { User as UserIcon, Briefcase, FileText, Home, Users, FileCheck, BarChart3, Settings, LogOut, Lock, X, Menu, TrendingUp } from 'lucide-react';
import { User, Job, CV, Match, Test, mockUsers } from './types';
import JobsSection from './components/JobsSection';
import CVsSection from './components/CVsSection';
import MatchingSection from './components/MatchingSection';
import CandidatesSection from './components/CandidatesSection';
import AnalyticsSection from './components/AnalyticsSection';

interface AdminDashboardProps {
  user: User;
  users: User[];
  onLogout: () => void;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
  calculateMatch: (job: Job, cv: CV) => number;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showNewJobForm: boolean;
  setShowNewJobForm: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  users,
  onLogout,
  jobs,
  setJobs,
  cvs,
  setCvs,
  matches,
  setMatches,
  tests,
  setTests,
  setUsers,
  setCurrentUser,
  calculateMatch,
  sidebarOpen,
  setSidebarOpen,
  showNewJobForm,
  setShowNewJobForm,
  onPasswordChange
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'cvs' | 'matching' | 'candidates' | 'analytics'>('overview');

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
    { label: 'Tests Completed', value: tests.filter(t => t.completed).length, icon: TrendingUp, color: 'from-orange-500 to-red-500' }
  ];

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: Home },
    { id: 'jobs' as const, label: 'Job Descriptions', icon: Briefcase },
    { id: 'cvs' as const, label: 'CVs', icon: FileText },
    { id: 'matching' as const, label: 'Matching', icon: FileCheck },
    { id: 'candidates' as const, label: 'Candidates', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 }
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
              <div className="flex items-center space-x-3">                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FasTrack</span>
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
                <UserIcon className="w-6 h-6 text-white" />
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
                        <div className="w-5 h-5 text-gray-400">⏱️</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match, index) => (
                      <div key={match.matchId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
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
                    {matches.length === 0 && (
                      <p className="text-gray-400 text-center py-2">No matches yet</p>
                    )}
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
          )}          {activeSection === 'cvs' && (
            <CVsSection 
              cvs={cvs}
              setCvs={setCvs}
              currentUser={user}
            />
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
          )}          {activeSection === 'candidates' && (            <CandidatesSection 
              users={users}
              cvs={cvs} 
              tests={tests}
              jobs={jobs}
              setTests={setTests}
              setUsers={setUsers}
              setCvs={setCvs}
              currentUser={user}
              setCurrentUser={setCurrentUser}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsSection jobs={jobs} cvs={cvs} matches={matches} tests={tests} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
