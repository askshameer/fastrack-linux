import React, { useState, useEffect } from 'react';
import { CheckCircle, Timer, AlertCircle, Search, Filter, ChevronDown } from 'lucide-react';
import { Match, Job, CV, Test } from '../types';

interface MatchingSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  calculateMatch: (job: Job, cv: CV) => number;
}

const MatchingSection: React.FC<MatchingSectionProps> = ({ 
  jobs, 
  cvs, 
  matches, 
  setMatches, 
  tests, 
  setTests, 
  calculateMatch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByJob, setFilterByJob] = useState<number | null>(null);
  const [showJobFilter, setShowJobFilter] = useState(false);
  const [filterByPercentage, setFilterByPercentage] = useState<number>(0);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  // Generate matches if none exist
  useEffect(() => {
    if (matches.length === 0 && jobs.length > 0 && cvs.length > 0) {
      const newMatches: Match[] = [];
      
      jobs.forEach(job => {
        cvs.forEach(cv => {
          const matchPercentage = calculateMatch(job, cv);
          if (matchPercentage > 0) {
            newMatches.push({
              matchId: `${job.id}-${cv.id}`,
              jobId: job.id,
              cvId: cv.id,
              percentage: matchPercentage,
              job: job,
              cv: cv,
              testEnabled: false
            });
          }
        });
      });
      
      setMatches(newMatches);
    }
  }, [jobs, cvs, matches.length, calculateMatch, setMatches]);

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          match.cv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = filterByJob === null || match.jobId === filterByJob;
    const matchesPercentage = match.percentage >= filterByPercentage;
    
    return matchesSearch && matchesJob && matchesPercentage;
  }).sort((a, b) => b.percentage - a.percentage);

  const handleEnableTest = (match: Match) => {
    // Check if a test already exists for this job and CV
    const existingTest = tests.find(t => t.jobId === match.jobId && t.userId === match.cv.userId);
    
    if (existingTest) {
      alert('A test for this job and candidate already exists.');
      return;
    }
    
    // Create a new test
    const newTest: Test = {
      id: tests.length + 1,
      jobId: match.jobId,
      userId: match.cv.userId,
      enabled: true,
      completed: false,
      score: null,
      enabledAt: new Date()
    };
    
    setTests([...tests, newTest]);
    
    // Update match to show test is enabled
    setMatches(matches.map(m => 
      m.matchId === match.matchId ? { ...m, testEnabled: true } : m
    ));
    
    alert(`Test for "${match.job.title}" has been enabled for the candidate.`);
  };

  // Run matching for a specific job
  const handleRunMatching = () => {
    if (!selectedJob) return;
    
    const job = jobs.find(j => j.id === selectedJob);
    if (!job) return;
    
    // Filter CVs based on availability
    const eligibleCVs = cvs.filter(cv => cv.availability !== false);
    
    // Create new matches
    const newMatchesForJob = eligibleCVs.map(cv => {
      const matchPercentage = calculateMatch(job, cv);
      return {
        matchId: `${job.id}-${cv.id}`,
        jobId: job.id,
        cvId: cv.id,
        percentage: matchPercentage,
        job: job,
        cv: cv,
        testEnabled: false
      };
    }).filter(match => match.percentage > 0);
    
    // Remove previous matches for this job
    const otherMatches = matches.filter(m => m.jobId !== selectedJob);
    
    // Add new matches
    setMatches([...otherMatches, ...newMatchesForJob]);
    
    alert(`Matching completed for "${job.title}". Found ${newMatchesForJob.length} potential matches.`);
  };

  return (
    <div className="space-y-6">      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Matching</h3>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1 items-center">
            <span className="text-gray-400 text-sm">Min Match:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filterByPercentage}
              onChange={(e) => setFilterByPercentage(parseInt(e.target.value))}
              className="w-24 accent-purple-500"
            />
            <span className="text-white text-sm w-8">{filterByPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Job Selection and Run Matching */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-gray-400 mb-2">Select Job to Match</label>
          <select
            value={selectedJob || ''}
            onChange={(e) => setSelectedJob(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a job...</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRunMatching}
          disabled={!selectedJob}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Matching
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowJobFilter(!showJobFilter)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-all"
          >
            <Filter size={18} />
            <span>Filter by Job</span>
            <ChevronDown size={16} className={`transition-transform ${showJobFilter ? 'rotate-180' : ''}`} />
          </button>
          {showJobFilter && (
            <div className="absolute z-10 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="p-2">
                <div 
                  className={`px-4 py-2 cursor-pointer rounded ${filterByJob === null ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                  onClick={() => { setFilterByJob(null); setShowJobFilter(false); }}
                >
                  All Jobs
                </div>
                {jobs.map(job => (
                  <div 
                    key={job.id}
                    className={`px-4 py-2 cursor-pointer rounded ${filterByJob === job.id ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                    onClick={() => { setFilterByJob(job.id); setShowJobFilter(false); }}
                  >
                    {job.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredMatches.map(match => {
            const test = tests.find(t => t.jobId === match.jobId && t.userId === match.cv.userId);
            
            return (
              <div key={match.matchId} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="text-lg font-semibold text-white">{match.job.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400">Match with:</span>
                      <span className="text-white">{match.cv.fileName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Match Percentage */}
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full ${getPercentageColor(match.percentage)} flex items-center justify-center text-white font-bold`}>
                          {match.percentage}%
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm">Match Score</div>
                    </div>
                    
                    {/* Test Status */}
                    <div className="flex flex-col items-center">
                      {!test ? (
                        <button
                          onClick={() => handleEnableTest(match)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center space-x-1"
                        >
                          <Timer size={16} />
                          <span>Enable Test</span>
                        </button>
                      ) : test.completed ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle size={16} />
                            <span>Test Completed</span>
                          </div>
                          <div className="text-white font-bold mt-1">Score: {test.score}%</div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <AlertCircle size={16} />
                          <span>Test Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <div>
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">Candidate Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {match.cv.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2 py-1 rounded-md text-xs ${
                            match.job.requiredSkills.some(s => s.toLowerCase() === skill.toLowerCase())
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-purple-500/20 text-purple-300'
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
          <p className="text-gray-400">No matches found. Add more jobs and CVs to generate matches.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on percentage
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-600';
  if (percentage >= 60) return 'bg-blue-600';
  if (percentage >= 40) return 'bg-yellow-600';
  return 'bg-red-600';
};

export default MatchingSection;
