import React, { useState } from 'react';
import { User as UserIcon, Briefcase, FileText, Clock, CheckCircle, XCircle, Upload, Timer, Download, Menu, X, Home, Users, LogOut, Lock } from 'lucide-react';
import { User, Job, CV, Match, Test, Question } from './types';

interface UserDashboardProps {
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
  onLogout: () => void;
  jobs: Job[];
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  matches: Match[];
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  questions: Question[];
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPasswordChange: (userId: number, oldPassword: string, newPassword: string) => boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  users,
  setUsers,
  setCurrentUser,
  onLogout,
  jobs,
  cvs,
  setCvs,
  matches,
  tests,
  setTests,
  questions,
  sidebarOpen,
  setSidebarOpen,
  onPasswordChange
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'cvs' | 'jobs' | 'tests'>('overview');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newCV, setNewCV] = useState({
    fileName: '',
    skills: '',
    experience: ''
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [availability, setAvailability] = useState(user.availability || false);

  // Get the user's CV
  const userCV = cvs.find(cv => cv.userId === user.id);

  // Get the user's matches
  const userMatches = matches.filter(match => userCV && match.cvId === userCV.id);

  // Get the user's tests
  const userTests = tests.filter(test => test.userId === user.id);
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    const success = onPasswordChange(user.id, passwordData.oldPassword, passwordData.newPassword);
    
    if (success) {
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      alert('Password changed successfully!');
    } else {
      alert('Failed to change password. Please check your current password.');
    }
  };  const handleAvailabilityToggle = () => {
    const newAvailability = !availability;
    setAvailability(newAvailability);
    
    // Update CV availability if it exists
    if (userCV) {
      const updatedCVs = cvs.map(cv => 
        cv.id === userCV.id ? { ...cv, availability: newAvailability } : cv
      );
      setCvs(updatedCVs);
    }
    
    // Update the users collection
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, availability: newAvailability } : u
    ));
    
    // Update the currentUser if setCurrentUser is provided
    if (setCurrentUser) {
      setCurrentUser({
        ...user,
        availability: newAvailability
      });
    }
  };

  const handleUploadCV = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user already has a CV
    if (userCV) {
      // Update existing CV
      const updatedCVs = cvs.map(cv => 
        cv.id === userCV.id 
          ? { 
              ...cv, 
              fileName: newCV.fileName || cv.fileName,
              skills: newCV.skills ? newCV.skills.split(',').map(s => s.trim()) : cv.skills,
              experience: newCV.experience || cv.experience,
              uploadedAt: new Date(),
              availability: availability
            } 
          : cv
      );
      setCvs(updatedCVs);
    } else {
      // Create new CV
      const newCVObject: CV = {
        id: cvs.length + 1,
        userId: user.id,
        fileName: newCV.fileName || `${user.name.replace(/\s+/g, '_')}_CV.pdf`,
        skills: newCV.skills.split(',').map(s => s.trim()),
        experience: newCV.experience,
        uploadedAt: new Date(),
        availability: availability
      };
      setCvs([...cvs, newCVObject]);
    }
    
    // Reset form and close modal
    setNewCV({ fileName: '', skills: '', experience: '' });
    setUploadModalOpen(false);
  };

  const startTest = (test: Test) => {
    // Check if test has already been completed
    if (test.completed) {
      alert('You have already completed this test.');
      return;
    }
    
    // Get random questions for the test
    const testQs = [...questions]
      .sort(() => 0.5 - Math.random()) // Shuffle questions
      .slice(0, 5); // Take 5 random questions
    
    setTestQuestions(testQs);
    setTestAnswers(new Array(testQs.length).fill(-1)); // Initialize answers array
    setSelectedTest(test);
    setShowResults(false);
    setTestComplete(false);
    setShowTestModal(true);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...testAnswers];
    newAnswers[questionIndex] = optionIndex;
    setTestAnswers(newAnswers);
  };

  const submitTest = () => {
    // Check if all questions are answered
    if (testAnswers.some(answer => answer === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    // Calculate score
    let correctAnswers = 0;
    testQuestions.forEach((question, index) => {
      if (testAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / testQuestions.length) * 100);
    setTestScore(score);
    
    // Update test in the tests array
    if (selectedTest) {
      const updatedTests = tests.map(t => 
        t.id === selectedTest.id 
          ? { ...t, completed: true, score: score, completedAt: new Date() } 
          : t
      );
      setTests(updatedTests);
    }
    
    setShowResults(true);
    setTestComplete(true);
  };

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: Home },
    { id: 'profile' as const, label: 'My Profile', icon: UserIcon },
    { id: 'cvs' as const, label: 'My CV', icon: FileText },
    { id: 'jobs' as const, label: 'Job Opportunities', icon: Briefcase },
    { id: 'tests' as const, label: 'My Tests', icon: Timer }
  ];

  const getJobById = (jobId: number) => {
    return jobs.find(job => job.id === jobId);
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
                className={`flex items-center w-full px-4 py-3 rounded-lg ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">{user.name}</h4>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center w-full px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white"
              >
                <Lock className="w-5 h-5 mr-3" />
                <span>Change Password</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'profile' && 'My Profile'}
              {activeSection === 'cvs' && 'My CV'}
              {activeSection === 'jobs' && 'Job Opportunities'}
              {activeSection === 'tests' && 'My Tests'}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-400">
                  {availability ? 'Available' : 'Not Available'}
                </span>
              </div>
              <button
                onClick={handleAvailabilityToggle}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Toggle
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard 
                  title="Your CV" 
                  value={userCV ? "Uploaded" : "Not Uploaded"} 
                  icon={FileText} 
                  color={userCV ? "from-green-500 to-emerald-500" : "from-red-500 to-orange-500"}
                  status={userCV ? "complete" : "incomplete"}
                />
                <InfoCard 
                  title="Job Matches" 
                  value={userMatches.length.toString()} 
                  icon={Briefcase} 
                  color="from-blue-500 to-cyan-500"
                  status="info"
                />
                <InfoCard 
                  title="Pending Tests" 
                  value={userTests.filter(t => !t.completed).length.toString()} 
                  icon={Timer} 
                  color="from-purple-500 to-pink-500"
                  status="pending"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => {
                      setActiveSection('cvs');
                      setUploadModalOpen(true);
                    }}
                    className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Upload className="w-8 h-8 text-purple-400 mb-2" />
                    <span className="text-white">{userCV ? "Update CV" : "Upload CV"}</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('jobs')}
                    className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Briefcase className="w-8 h-8 text-blue-400 mb-2" />
                    <span className="text-white">Browse Jobs</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('tests')}
                    className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Timer className="w-8 h-8 text-green-400 mb-2" />
                    <span className="text-white">Take Tests</span>
                  </button>
                </div>
              </div>

              {/* Recent Job Matches */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Job Matches</h3>
                {userMatches.length > 0 ? (
                  <div className="space-y-4">
                    {userMatches
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 3)
                      .map(match => (
                        <div key={match.matchId} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                          <div>
                            <h4 className="text-white font-medium">{match.job.title}</h4>
                            <p className="text-gray-400 text-sm">{match.job.experienceLevel} experience</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-white font-bold">
                              {match.percentage}% Match
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              match.testEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {match.testEnabled ? 'Test Available' : 'No Test Yet'}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    <button 
                      onClick={() => setActiveSection('jobs')}
                      className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                    >
                      View All Job Matches
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No job matches found. Upload your CV to get matched with jobs!</p>
                    {!userCV && (
                      <button 
                        onClick={() => {
                          setActiveSection('cvs');
                          setUploadModalOpen(true);
                        }}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                      >
                        Upload CV
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-400">
                        {availability ? 'Available for Opportunities' : 'Not Available'}
                      </span>
                    </div>
                    <button
                      onClick={handleAvailabilityToggle}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                    >
                      {availability ? 'Set Unavailable' : 'Set Available'}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Account Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                          <p className="text-white">{user.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                          <p className="text-white">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Account Type</label>
                          <p className="text-white capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                      >
                        Change Password
                      </button>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Profile Summary</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">CV Status</label>
                          <div className="flex items-center space-x-2">
                            {userCV ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <p className="text-white">Uploaded on {userCV.uploadedAt.toLocaleDateString()}</p>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <p className="text-white">Not Uploaded</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Experience</label>
                          <p className="text-white">{userCV ? userCV.experience : 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Skills</label>
                          {userCV ? (
                            <div className="flex flex-wrap gap-2">
                              {userCV.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white">No skills listed</p>
                          )}
                        </div>
                      </div>
                      {!userCV && (
                        <button
                          onClick={() => {
                            setActiveSection('cvs');
                            setUploadModalOpen(true);
                          }}
                          className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Upload CV
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CV Section */}
          {activeSection === 'cvs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">My CV</h3>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>{userCV ? 'Update CV' : 'Upload CV'}</span>
                </button>
              </div>

              {userCV ? (
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{userCV.fileName}</h4>
                      <p className="text-gray-400 text-sm">Uploaded on {userCV.uploadedAt.toLocaleDateString()}</p>
                      
                      <div className="mt-6 space-y-4">
                        <div>
                          <h5 className="text-white font-medium mb-2">Experience</h5>
                          <p className="text-gray-300">{userCV.experience}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-white font-medium mb-2">Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {userCV.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 flex flex-col justify-start items-end">
                      <button
                        onClick={() => alert(`Downloading CV: ${userCV.fileName}`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                      <div className="mt-4 flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${userCV.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-400">
                          {userCV.availability ? 'Available for Opportunities' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 text-center">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No CV Uploaded</h3>
                  <p className="text-gray-400 mb-6">Upload your CV to get matched with job opportunities.</p>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Upload CV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Job Opportunities</h3>

              {/* Matches */}
              {userMatches.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {userMatches
                    .sort((a, b) => b.percentage - a.percentage)
                    .map(match => {
                      const test = userTests.find(t => t.jobId === match.jobId);
                      
                      return (
                        <div key={match.matchId} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-semibold text-white">{match.job.title}</h4>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs">
                                  {match.job.experienceLevel}
                                </span>
                              </div>
                              <p className="text-gray-400 mt-1">Posted on {match.job.createdAt.toLocaleDateString()}</p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Match Percentage */}
                              <div className="flex items-center space-x-2">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                  <div className={`w-10 h-10 rounded-full ${getMatchColor(match.percentage)} flex items-center justify-center text-white font-bold`}>
                                    {match.percentage}%
                                  </div>
                                </div>
                                <div className="text-gray-300 text-sm">Match</div>
                              </div>
                              
                              {/* Test Status */}
                              {test ? (
                                test.completed ? (
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center space-x-1 text-green-400">
                                      <CheckCircle size={16} />
                                      <span>Test Completed</span>
                                    </div>
                                    <div className="text-white font-bold mt-1">Score: {test.score}%</div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startTest(test)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center space-x-1"
                                  >
                                    <Timer size={16} />
                                    <span>Take Test</span>
                                  </button>
                                )
                              ) : (
                                <div className="text-gray-400">
                                  {match.testEnabled ? 'Test not available yet' : 'No test required'}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-white mb-4">{match.job.description}</p>
                            
                            <div>
                              <h5 className="text-sm font-semibold text-gray-400 mb-2">Required Skills</h5>
                              <div className="flex flex-wrap gap-2">
                                {match.job.requiredSkills.map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-2 py-1 rounded-md text-xs ${
                                      match.cv.skills.some(s => s.toLowerCase() === skill.toLowerCase())
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 text-center">
                  <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Job Matches Found</h3>
                  {userCV ? (
                    <p className="text-gray-400">We couldn't find any matching jobs for your skills. Check back later!</p>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-6">Upload your CV to get matched with job opportunities.</p>
                      <button
                        onClick={() => {
                          setActiveSection('cvs');
                          setUploadModalOpen(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        Upload CV
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tests Section */}
          {activeSection === 'tests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">My Tests</h3>

              {userTests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-4">Test Status</h4>
                      <div className="flex justify-center">
                        <div className="relative w-40 h-40">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#444"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#4ade80"
                              strokeWidth="3"
                              strokeDasharray={`${(userTests.filter(t => t.completed).length / userTests.length) * 100}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-white">
                              {Math.round((userTests.filter(t => t.completed).length / userTests.length) * 100)}%
                            </div>
                            <div className="text-sm text-gray-400">Completed</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-400">
                            {userTests.filter(t => t.completed).length}
                          </div>
                          <div className="text-sm text-gray-400">Completed</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-400">
                            {userTests.filter(t => !t.completed).length}
                          </div>
                          <div className="text-sm text-gray-400">Pending</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-4">Your Performance</h4>
                      {userTests.some(t => t.completed && t.score !== null) ? (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-400">Average Score</span>
                              <span className="text-sm font-medium text-white">
                                {Math.round(
                                  userTests
                                    .filter(t => t.completed && t.score !== null)
                                    .reduce((sum, t) => sum + (t.score || 0), 0) / 
                                    userTests.filter(t => t.completed && t.score !== null).length
                                )}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                                style={{ 
                                  width: `${Math.round(
                                    userTests
                                      .filter(t => t.completed && t.score !== null)
                                      .reduce((sum, t) => sum + (t.score || 0), 0) / 
                                      userTests.filter(t => t.completed && t.score !== null).length
                                  )}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-400">Highest Score</span>
                              <span className="text-sm font-medium text-white">
                                {Math.max(
                                  ...userTests
                                    .filter(t => t.completed && t.score !== null)
                                    .map(t => t.score || 0)
                                )}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full"
                                style={{ 
                                  width: `${Math.max(
                                    ...userTests
                                      .filter(t => t.completed && t.score !== null)
                                      .map(t => t.score || 0)
                                  )}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40">
                          <p className="text-gray-400">Complete tests to see your performance</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Your Tests</h4>
                    <div className="space-y-4">
                      {userTests.map(test => {
                        const job = getJobById(test.jobId);
                        
                        return (
                          <div key={test.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                            <div>
                              <h5 className="text-white font-medium">{job ? job.title : 'Unknown Job'}</h5>
                              <p className="text-gray-400 text-sm">
                                {test.enabled 
                                  ? `Enabled on ${test.enabledAt.toLocaleDateString()}` 
                                  : 'Not yet enabled'}
                              </p>
                            </div>
                            
                            <div className="mt-3 md:mt-0 flex items-center space-x-4">
                              {test.completed ? (
                                <div className="flex items-center space-x-2">
                                  <div className={`px-3 py-1 rounded-full text-sm ${
                                    test.score && test.score >= 70
                                      ? 'bg-green-500/20 text-green-300'
                                      : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    {test.score}% Score
                                  </div>
                                  <span className="text-gray-400 text-sm">
                                    {test.completedAt ? `Completed on ${test.completedAt.toLocaleDateString()}` : ''}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startTest(test)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                                >
                                  Take Test
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 text-center">
                  <Timer className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Tests Available</h3>
                  <p className="text-gray-400">You don't have any tests assigned yet. Tests will be enabled when your CV is matched with a job.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Upload CV Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">{userCV ? 'Update CV' : 'Upload CV'}</h3>
            <form onSubmit={handleUploadCV}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">File Name</label>
                <input
                  type="text"
                  value={newCV.fileName}
                  onChange={(e) => setNewCV({...newCV, fileName: e.target.value})}
                  placeholder={userCV ? userCV.fileName : "resume.pdf"}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newCV.skills}
                  onChange={(e) => setNewCV({...newCV, skills: e.target.value})}
                  placeholder={userCV ? userCV.skills.join(', ') : "React, TypeScript, Node.js"}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={!userCV}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Experience</label>
                <input
                  type="text"
                  value={newCV.experience}
                  onChange={(e) => setNewCV({...newCV, experience: e.target.value})}
                  placeholder={userCV ? userCV.experience : "5 years"}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={!userCV}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  {userCV ? 'Update' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Test Modal */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {showResults ? 'Test Results' : `Test for ${getJobById(selectedTest.jobId)?.title || 'Job'}`}
              </h3>
              {!testComplete && (
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {showResults ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-6">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <div className={`w-28 h-28 rounded-full ${getScoreColor(testScore)} flex items-center justify-center`}>
                      <span className="text-3xl font-bold text-white">{testScore}%</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white">
                    {testScore >= 70 ? 'Congratulations!' : 'Test Completed'}
                  </h4>
                  <p className="text-gray-400 mt-2">
                    {testScore >= 70 
                      ? 'You passed the test with a great score!' 
                      : 'You completed the test. Keep learning and try again!'}
                  </p>
                </div>
                
                <div className="space-y-6">
                  {testQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-white font-medium mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex} 
                            className={`p-3 rounded-lg ${
                              testAnswers[qIndex] === oIndex && oIndex === question.correct
                                ? 'bg-green-500/20 border border-green-500'
                                : testAnswers[qIndex] === oIndex && oIndex !== question.correct
                                ? 'bg-red-500/20 border border-red-500'
                                : oIndex === question.correct
                                ? 'bg-green-500/20 border border-green-500'
                                : 'bg-gray-800 border border-gray-700'
                            }`}
                          >
                            <span className="text-white">{option}</span>
                            {testAnswers[qIndex] === oIndex && oIndex === question.correct && (
                              <span className="ml-2 text-green-400">(Correct)</span>
                            )}
                            {testAnswers[qIndex] === oIndex && oIndex !== question.correct && (
                              <span className="ml-2 text-red-400">(Your answer)</span>
                            )}
                            {testAnswers[qIndex] !== oIndex && oIndex === question.correct && (
                              <span className="ml-2 text-green-400">(Correct answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowTestModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-500/20 border border-indigo-500 p-4 rounded-lg">
                  <p className="text-white">
                    Complete the following test for <span className="font-semibold">{getJobById(selectedTest.jobId)?.title}</span>. 
                    Answer all questions to submit your test.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {testQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-white font-medium mb-3">
                        {qIndex + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex} 
                            className={`p-3 rounded-lg cursor-pointer ${
                              testAnswers[qIndex] === oIndex
                                ? 'bg-purple-500/20 border border-purple-500'
                                : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                            }`}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                          >
                            <span className="text-white">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={submitTest}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                  disabled={testAnswers.some(answer => answer === -1)}
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  status: 'complete' | 'incomplete' | 'pending' | 'info';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon: Icon, color, status }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-gray-400">{title}</p>
          <div className="flex items-center space-x-2">
            <h4 className="text-xl font-bold text-white">{value}</h4>
            {status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {status === 'incomplete' && <XCircle className="w-4 h-4 text-red-500" />}
            {status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getMatchColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-600';
  if (percentage >= 60) return 'bg-blue-600';
  if (percentage >= 40) return 'bg-yellow-600';
  return 'bg-red-600';
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-blue-600';
  if (score >= 40) return 'bg-yellow-600';
  return 'bg-red-600';
};

export default UserDashboard;
