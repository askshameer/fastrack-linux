import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Job } from '../types';

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

const JobsSection: React.FC<JobsSectionProps> = ({ 
  jobs, 
  setJobs, 
  showNewJobForm, 
  setShowNewJobForm 
}) => {
  const [newJob, setNewJob] = useState<JobFormData>({
    title: '',
    description: '',
    requiredSkills: '',
    experienceLevel: ''
  });
  const [editingJob, setEditingJob] = useState<JobEditData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const job: Job = {
      id: jobs.length + 1,
      title: newJob.title,
      description: newJob.description,
      requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()),
      experienceLevel: newJob.experienceLevel,
      createdAt: new Date()
    };
    setJobs([...jobs, job]);
    setNewJob({ title: '', description: '', requiredSkills: '', experienceLevel: '' });
    setShowNewJobForm(false);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob({
      id: job.id,
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills.join(', '),
      experienceLevel: job.experienceLevel
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
  };

  const handleDeleteJob = (jobId: number) => {
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
                rows={3}
                placeholder="Job description..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={newJob.requiredSkills}
                onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="React, Node.js, MongoDB"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <input
                type="text"
                value={newJob.experienceLevel}
                onChange={(e) => setNewJob({ ...newJob, experienceLevel: e.target.value })}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5+ years"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
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
                rows={3}
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
        {jobs.length === 0 && (
          <div className="col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-gray-400">No jobs available. Click "New Job" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsSection;
