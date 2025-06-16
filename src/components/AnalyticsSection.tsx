import React from 'react';
import { BarChart3, TrendingUp, User as UserIcon, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Job, CV, Match, Test } from '../types';

interface AnalyticsSectionProps {
  jobs: Job[];
  cvs: CV[];
  matches: Match[];
  tests: Test[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ 
  jobs, 
  cvs, 
  matches, 
  tests 
}) => {
  // Calculate analytics data
  const totalJobs = jobs.length;
  const totalCVs = cvs.length;
  const totalMatches = matches.length;
  const totalTests = tests.length;
  const completedTests = tests.filter(test => test.completed).length;
  const pendingTests = totalTests - completedTests;
  const averageScore = tests.filter(test => test.completed && test.score !== null)
    .reduce((sum, test) => sum + (test.score || 0), 0) / 
    (tests.filter(test => test.completed && test.score !== null).length || 1);
  
  // Calculate match score distribution
  const matchScoreDistribution = [
    { range: '0-25%', count: 0 },
    { range: '26-50%', count: 0 },
    { range: '51-75%', count: 0 },
    { range: '76-100%', count: 0 }
  ];
  
  matches.forEach(match => {
    if (match.percentage <= 25) matchScoreDistribution[0].count++;
    else if (match.percentage <= 50) matchScoreDistribution[1].count++;
    else if (match.percentage <= 75) matchScoreDistribution[2].count++;
    else matchScoreDistribution[3].count++;
  });
  
  // Calculate test score distribution
  const testScoreDistribution = [
    { range: '0-25%', count: 0 },
    { range: '26-50%', count: 0 },
    { range: '51-75%', count: 0 },
    { range: '76-100%', count: 0 }
  ];
  
  tests.filter(test => test.completed && test.score !== null).forEach(test => {
    const score = test.score || 0;
    if (score <= 25) testScoreDistribution[0].count++;
    else if (score <= 50) testScoreDistribution[1].count++;
    else if (score <= 75) testScoreDistribution[2].count++;
    else testScoreDistribution[3].count++;
  });
  
  // Find top skills across all CVs
  const skillFrequency: {[key: string]: number} = {};
  cvs.forEach(cv => {
    cv.skills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
  });
  
  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));
  
  // Find most in-demand skills from jobs
  const jobSkillFrequency: {[key: string]: number} = {};
  jobs.forEach(job => {
    job.requiredSkills.forEach(skill => {
      jobSkillFrequency[skill] = (jobSkillFrequency[skill] || 0) + 1;
    });
  });
  
  const mostInDemandSkills = Object.entries(jobSkillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Jobs" 
          value={totalJobs} 
          icon={Briefcase} 
          color="from-blue-500 to-cyan-500" 
        />
        <SummaryCard 
          title="Total CVs" 
          value={totalCVs} 
          icon={FileText} 
          color="from-purple-500 to-pink-500" 
        />
        <SummaryCard 
          title="Matches Found" 
          value={totalMatches} 
          icon={CheckCircle} 
          color="from-green-500 to-emerald-500" 
        />
        <SummaryCard 
          title="Average Test Score" 
          value={`${Math.round(averageScore)}%`} 
          icon={TrendingUp} 
          color="from-orange-500 to-red-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Match Score Distribution</h4>
          <div className="h-64 flex items-end space-x-4">
            {matchScoreDistribution.map((item, idx) => (
              <BarChartItem 
                key={idx} 
                label={item.range} 
                value={item.count} 
                maxValue={Math.max(...matchScoreDistribution.map(item => item.count))} 
                color={getBarColor(idx)} 
              />
            ))}
          </div>
        </div>

        {/* Test Score Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Test Score Distribution</h4>
          <div className="h-64 flex items-end space-x-4">
            {testScoreDistribution.map((item, idx) => (
              <BarChartItem 
                key={idx} 
                label={item.range} 
                value={item.count} 
                maxValue={Math.max(...testScoreDistribution.map(item => item.count))} 
                color={getBarColor(idx)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Top Skills in CVs</h4>
          <div className="space-y-3">
            {topSkills.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                    style={{ width: `${(item.count / Math.max(...topSkills.map(s => s.count))) * 100}%` }}
                  ></div>
                </div>
                <div className="ml-4 w-32 flex justify-between">
                  <span className="text-white">{item.skill}</span>
                  <span className="text-gray-400">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most In-Demand Skills */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Most In-Demand Skills</h4>
          <div className="space-y-3">
            {mostInDemandSkills.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full"
                    style={{ width: `${(item.count / Math.max(...mostInDemandSkills.map(s => s.count))) * 100}%` }}
                  ></div>
                </div>
                <div className="ml-4 w-32 flex justify-between">
                  <span className="text-white">{item.skill}</span>
                  <span className="text-gray-400">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Test Status</h4>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
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
                    strokeDasharray={`${completedTests / totalTests * 100}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">{Math.round(completedTests / totalTests * 100)}%</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-400">{completedTests}</div>
                <div className="text-sm text-gray-400">Completed Tests</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-400">{pendingTests}</div>
                <div className="text-sm text-gray-400">Pending Tests</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h5 className="text-white font-semibold mb-3">Test Completion Rate</h5>
            <p className="text-gray-400">
              {totalTests > 0 
                ? `${Math.round(completedTests / totalTests * 100)}% of all tests have been completed. ${pendingTests} tests are still pending completion.`
                : 'No tests have been assigned yet.'}
            </p>
            <div className="mt-4">
              <h5 className="text-white font-semibold mb-2">Average Score: {Math.round(averageScore)}%</h5>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getScoreColor(averageScore)}`}
                  style={{ width: `${averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-gray-400">{title}</p>
          <h4 className="text-2xl font-bold text-white">{value}</h4>
        </div>
      </div>
    </div>
  );
};

interface BarChartItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const BarChartItem: React.FC<BarChartItemProps> = ({ label, value, maxValue, color }) => {
  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="w-full flex justify-center mb-2">
        <div 
          className={`w-12 rounded-t-lg ${color}`}
          style={{ height: `${height}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
};

// Helper functions
const getBarColor = (index: number): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500'
  ];
  return colors[index % colors.length];
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default AnalyticsSection;
