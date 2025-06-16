import React, { useState } from 'react';
import { CheckCircle, XCircle, Search, Timer, User as UserIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { User, CV, Test, Job } from '../types';

interface CandidatesSectionProps {
  users: User[];
  cvs: CV[];
  tests: Test[];
  jobs: Job[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  currentUser?: User;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const CandidatesSection: React.FC<CandidatesSectionProps> = ({ 
  users, 
  cvs, 
  tests, 
  jobs,
  setTests,
  setUsers,
  setCvs,
  currentUser,
  setCurrentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-tests' | 'completed-tests' | 'pending-tests'>('all');

  // Get only user accounts (non-admin)
  const candidates = users.filter(user => user.role === 'user');
  
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const candidateTests = tests.filter(test => test.userId === candidate.id);
    const hasTests = candidateTests.length > 0;
    const hasCompletedTests = candidateTests.some(test => test.completed);
    const hasPendingTests = candidateTests.some(test => !test.completed);
    
    if (filterStatus === 'with-tests' && !hasTests) return false;
    if (filterStatus === 'completed-tests' && !hasCompletedTests) return false;
    if (filterStatus === 'pending-tests' && !hasPendingTests) return false;
    
    return matchesSearch;
  });

  const getCandidateCV = (candidateId: number) => {
    return cvs.find(cv => cv.userId === candidateId);
  };

  const getCandidateTests = (candidateId: number) => {
    return tests
      .filter(test => test.userId === candidateId)
      .map(test => {
        const job = jobs.find(j => j.id === test.jobId);
        return { ...test, jobTitle: job ? job.title : 'Unknown Job' };
      });
  };

  const handleUpdateTestScore = (test: Test, newScore: number) => {
    if (newScore < 0 || newScore > 100) {
      alert('Score must be between 0 and 100');
      return;
    }
    
    setTests(tests.map(t => 
      t.id === test.id 
        ? { ...t, score: newScore, completed: true, completedAt: new Date() } 
        : t
    ));
    
    alert(`Score updated for test #${test.id}`);
  };
  const toggleCandidateAvailability = (candidateId: number, newAvailability: boolean) => {
    // Update user data
    setUsers(users.map(user => 
      user.id === candidateId 
        ? { ...user, availability: newAvailability }
        : user
    ));
    
    // Also update CV data to maintain consistency
    setCvs(cvs.map(cv => 
      cv.userId === candidateId 
        ? { ...cv, availability: newAvailability }
        : cv
    ));
    
    // Update currentUser if this is the same user
    if (currentUser && setCurrentUser && currentUser.id === candidateId) {
      setCurrentUser({
        ...currentUser,
        availability: newAvailability
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Candidates</h3>
        <div className="flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Candidates</option>
            <option value="with-tests">With Tests</option>
            <option value="completed-tests">Completed Tests</option>
            <option value="pending-tests">Pending Tests</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Candidates List */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCandidates.map(candidate => {
            const cv = getCandidateCV(candidate.id);
            const candidateTests = getCandidateTests(candidate.id);
            
            return (
              <div key={candidate.id} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{candidate.name}</h4>
                      <p className="text-gray-400">{candidate.email}</p>                      <div className="mt-2 flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => toggleCandidateAvailability(candidate.id, !candidate.availability)}
                            className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                            title={candidate.availability ? "Set as unavailable" : "Set as available"}
                          >
                            {candidate.availability ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-red-500" />
                            )}
                          </button>
                          <div className={`w-3 h-3 rounded-full ${candidate.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-400">
                            {candidate.availability ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        {cv && (
                          <div className="text-sm text-gray-400">
                            Experience: {cv.experience}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Tests:</span>
                      <span className="text-white">{candidateTests.length}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-white">{candidateTests.filter(t => t.completed).length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                {cv && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tests */}
                {candidateTests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">Test Status</h5>
                    <div className="space-y-3 mt-3">
                      {candidateTests.map((test) => (
                        <div key={test.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{test.jobTitle}</div>
                            <div className="text-sm text-gray-400">
                              {test.enabled 
                                ? `Enabled on ${test.enabledAt.toLocaleDateString()}` 
                                : 'Not yet enabled'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-0 flex items-center space-x-4">
                            {test.completed ? (
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle size={16} />
                                <span>Completed</span>
                                {test.score !== null && <span className="font-bold">Score: {test.score}%</span>}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-yellow-400">
                                <Timer size={16} />
                                <span>Pending</span>
                              </div>
                            )}
                            
                            {!test.completed && (
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  placeholder="Score"
                                  className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleUpdateTestScore(test, parseInt(e.target.value));
                                    }
                                  }}
                                />
                                <button 
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all text-xs"
                                  onClick={() => handleUpdateTestScore(test, 0)}
                                >
                                  Set As Completed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400">No candidates found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CandidatesSection;
