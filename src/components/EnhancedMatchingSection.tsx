import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, Star, Zap, MessageSquare, X } from 'lucide-react';
import AIMatchingService from '../services/aiMatching';

interface EnhancedMatch {
  cvId: number;
  jobId: number;
  finalScore: number;
  confidence: number;
  breakdown: {
    keyword: any;
    ai: any;
    weights: { keyword: number; ai: number };
  };
  insights: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  interviewFocus: string[];
  cv: any;
  job: any;
}

interface EnhancedMatchingSectionProps {
  jobs: any[];
  cvs: any[];
  matches: any[];
  setMatches: React.Dispatch<React.SetStateAction<any[]>>;
  tests: any[];
  setTests: React.Dispatch<React.SetStateAction<any[]>>;
}

const EnhancedMatchingSection: React.FC<EnhancedMatchingSectionProps> = ({
  jobs,
  cvs,
  matches,
  setMatches,
  tests,
  setTests
}) => {
  const [enhancedMatches, setEnhancedMatches] = useState<EnhancedMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<EnhancedMatch | null>(null);
  const [aiService, setAiService] = useState<AIMatchingService | null>(null);
  const [apiToken, setApiToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Check if we have a stored API token
    const storedToken = localStorage.getItem('hf_api_token');
    if (storedToken) {
      setApiToken(storedToken);
      setAiService(new AIMatchingService(storedToken));
    }

    // Load saved enhanced matches
    const savedMatches = localStorage.getItem('enhanced_matches');
    if (savedMatches) {
      try {
        const parsedMatches = JSON.parse(savedMatches);
        // Verify the matches are still valid with current jobs and CVs
        const validMatches = parsedMatches.filter((match: EnhancedMatch) => 
          jobs.some(job => job.id === match.jobId) && 
          cvs.some(cv => cv.id === match.cvId)
        );
        if (validMatches.length > 0) {
          setEnhancedMatches(validMatches);
        }
      } catch (error) {
        console.error('Failed to load saved matches:', error);
        localStorage.removeItem('enhanced_matches');
      }
    }
  }, [jobs, cvs]);

  const handleSetupAI = () => {
    if (apiToken.trim()) {
      localStorage.setItem('hf_api_token', apiToken);
      setAiService(new AIMatchingService(apiToken));
      setShowTokenInput(false);
    }
  };

  const runEnhancedMatching = async () => {
    if (!aiService) {
      setShowTokenInput(true);
      return;
    }

    setIsAnalyzing(true);
    const newEnhancedMatches: EnhancedMatch[] = [];

    console.log('Starting AI matching with CVs:', cvs.map(cv => ({ id: cv.id, fileName: cv.fileName, userId: cv.userId })));
    console.log('Jobs available:', jobs.map(job => ({ id: job.id, title: job.title })));

    try {
      for (const job of jobs) {
        for (const cv of cvs) {
          console.log(`Analyzing match between ${cv.fileName} and ${job.title}...`);
          
          const matchResult = await aiService.calculateHybridMatch(cv, job);
          
          const enhancedMatch: EnhancedMatch = {
            cvId: cv.id,
            jobId: job.id,
            finalScore: matchResult.finalScore,
            confidence: matchResult.confidence,
            breakdown: matchResult.breakdown,
            insights: matchResult.insights,
            interviewFocus: matchResult.interviewFocus,
            cv,
            job
          };

          newEnhancedMatches.push(enhancedMatch);
        }
      }

      // Sort by final score
      newEnhancedMatches.sort((a, b) => b.finalScore - a.finalScore);
      setEnhancedMatches(newEnhancedMatches);

      // Save enhanced matches to localStorage
      localStorage.setItem('enhanced_matches', JSON.stringify(newEnhancedMatches));

      // Update the main matches state for backward compatibility
      const basicMatches = newEnhancedMatches.map(match => ({
        matchId: `${match.cvId}_${match.jobId}`,
        cvId: match.cvId,
        jobId: match.jobId,
        percentage: match.finalScore,
        cv: match.cv,
        job: match.job,
        testEnabled: false
      }));
      setMatches(basicMatches);

    } catch (error) {
      console.error('Enhanced matching failed:', error);
      alert('AI matching failed. Please check your API token and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSavedMatches = () => {
    localStorage.removeItem('enhanced_matches');
    setEnhancedMatches([]);
    setMatches([]);
  };

  // Clear saved matches when CVs or jobs change to ensure fresh results
  useEffect(() => {
    // If we have saved matches but the CV/job lists have changed, clear the matches
    const savedMatches = localStorage.getItem('enhanced_matches');
    if (savedMatches && enhancedMatches.length > 0) {
      try {
        const parsedMatches = JSON.parse(savedMatches);
        const hasInvalidMatches = parsedMatches.some((match: EnhancedMatch) => 
          !jobs.some(job => job.id === match.jobId) || 
          !cvs.some(cv => cv.id === match.cvId)
        );
        if (hasInvalidMatches) {
          console.log('Clearing outdated matches due to CV/job changes');
          clearSavedMatches();
        }
      } catch (error) {
        console.error('Error checking saved matches:', error);
        clearSavedMatches();
      }
    }
  }, [cvs.length, jobs.length]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const enableTest = async (match: EnhancedMatch) => {
    const existingTest = tests.find(t => t.userId === match.cv.userId && t.jobId === match.jobId);
    
    if (existingTest) {
      alert('Test already enabled for this candidate and job');
      return;
    }

    const newTest = {
      id: tests.length + 1,
      userId: match.cv.userId,
      jobId: match.jobId,
      enabled: true,
      completed: false,
      score: null,
      enabledAt: new Date()
    };

    setTests([...tests, newTest]);
    alert('Technical test enabled successfully!');
  };


  if (showTokenInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-6">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Setup AI Matching</h3>
              <p className="text-gray-400 text-sm">
                Enter your Hugging Face API token to enable AI-powered matching
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hugging Face API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="hf_..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your free token at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">huggingface.co</a>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSetupAI}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Setup AI Matching
                </button>
                <button
                  onClick={() => setShowTokenInput(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>AI-Enhanced Matching</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Hybrid matching combining keyword analysis + semantic AI understanding
            {enhancedMatches.length > 0 && (
              <span className="ml-2 text-blue-400">• {enhancedMatches.length} matches loaded</span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {!aiService && (
            <button
              onClick={() => setShowTokenInput(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              <Brain className="w-4 h-4" />
              <span>Setup AI</span>
            </button>
          )}
          
          <button
            onClick={runEnhancedMatching}
            disabled={isAnalyzing || !aiService}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run AI Matching</span>
              </>
            )}
          </button>
          
          {enhancedMatches.length > 0 && (
            <button
              onClick={clearSavedMatches}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Clear Results</span>
            </button>
          )}
          
          <button
            onClick={() => {
              console.log('Current CVs in component:', cvs.map(cv => ({ id: cv.id, fileName: cv.fileName, userId: cv.userId })));
              console.log('Current Jobs in component:', jobs.map(job => ({ id: job.id, title: job.title })));
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Enhanced Matches */}
      {enhancedMatches.length > 0 && (
        <div className="grid gap-4">
          {enhancedMatches.slice(0, 10).map((match, index) => (
            <div
              key={`${match.cvId}_${match.jobId}`}
              className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border transition-all hover:bg-gray-800/70 cursor-pointer ${getScoreBg(match.finalScore)}`}
              onClick={() => setSelectedMatch(selectedMatch?.cvId === match.cvId && selectedMatch?.jobId === match.jobId ? null : match)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{match.cv.fileName}</h4>
                    <span className="text-gray-400">→</span>
                    <h4 className="text-lg font-semibold text-white">{match.job.title}</h4>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className={`font-semibold ${getScoreColor(match.finalScore)}`}>
                        {match.finalScore}% Match
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">
                        {match.confidence}% Confidence
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {match.breakdown.ai.method === 'ai_semantic' ? (
                        <Brain className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        {match.breakdown.ai.method === 'ai_semantic' ? 'AI Enhanced' : 'Keyword Only'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      enableTest(match);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Enable Test
                  </button>
                  
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedMatch?.cvId === match.cvId && selectedMatch?.jobId === match.jobId && (
                <div className="border-t border-gray-700 pt-4 space-y-4">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h5 className="text-white font-medium mb-3 flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>Score Breakdown</span>
                      </h5>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Keyword Match:</span>
                          <span className="text-white">{match.breakdown.keyword.score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">AI Semantic:</span>
                          <span className="text-white">{match.breakdown.ai.overallScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience Match:</span>
                          <span className="text-white">{match.breakdown.ai.experienceMatch}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Skills Alignment:</span>
                          <span className="text-white">{match.breakdown.ai.skillsAlignment?.score || 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h5 className="text-white font-medium mb-3 flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Key Insights</span>
                      </h5>
                      
                      {match.breakdown.ai.reasoning && (
                        <div className="space-y-2 text-xs">
                          {match.breakdown.ai.reasoning.map((reason: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-300">{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strengths and Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h5 className="text-green-400 font-medium mb-3 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Strengths</span>
                      </h5>
                      
                      <div className="space-y-2">
                        {match.insights.strengths.map((strength, idx) => (
                          <div key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h5 className="text-orange-400 font-medium mb-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Gaps & Concerns</span>
                      </h5>
                      
                      <div className="space-y-2">
                        {match.insights.gaps.map((gap, idx) => (
                          <div key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                            <div className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{gap}</span>
                          </div>
                        ))}
                        {match.insights.gaps.length === 0 && (
                          <span className="text-sm text-gray-500">No significant gaps identified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h5 className="text-blue-400 font-medium mb-3 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Recommendations</span>
                    </h5>
                    
                    <div className="space-y-2">
                      {match.insights.recommendations.map((rec, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Questions */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h5 className="text-purple-400 font-medium mb-3 flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Suggested Interview Questions</span>
                    </h5>
                    
                    <div className="space-y-2">
                      {match.interviewFocus.map((question, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                          <span className="text-purple-400 font-semibold flex-shrink-0">{idx + 1}.</span>
                          <span>{question}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {enhancedMatches.length === 0 && !isAnalyzing && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No AI Analysis Yet</h3>
          <p className="text-gray-500 mb-4">
            Run AI-enhanced matching to get detailed insights and recommendations
          </p>
          {!aiService ? (
            <button
              onClick={() => setShowTokenInput(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              Setup AI Matching
            </button>
          ) : (
            <button
              onClick={runEnhancedMatching}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Start AI Analysis
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchingSection;