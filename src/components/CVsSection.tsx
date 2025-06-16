import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, Search, Filter, ChevronDown, FileText } from 'lucide-react';
import { CV, User } from '../types';
import { FileUtils, CVParser } from '../utils/textProcessing';

interface CVsSectionProps {
  cvs: CV[];
  setCvs: React.Dispatch<React.SetStateAction<CV[]>>;
  currentUser: User;
}

const CVsSection: React.FC<CVsSectionProps> = ({ cvs, setCvs, currentUser }) => {  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newCV, setNewCV] = useState({
    fileName: '',
    skills: '',
    experience: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewCV, setPreviewCV] = useState<CV | null>(null);

  // Get all unique skills from all CVs for filter dropdown
  const allSkills = Array.from(new Set(cvs.flatMap(cv => cv.skills))).sort();

  const filteredCVs = cvs.filter(cv => {
    const matchesSearch = cv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !filterSkill || cv.skills.some(skill => 
      skill.toLowerCase() === filterSkill.toLowerCase()
    );
    return matchesSearch && matchesSkill;
  });
  const handleUploadCV = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile) {
      setFileError('Please select a CV file to upload');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Extract text content from file
      const fileText = await FileUtils.readFileAsText(cvFile);
      
      // Extract skills and experience from CV text
      const extractedSkills = CVParser.extractSkills(fileText);
      const extractedExperience = CVParser.extractExperience(fileText);
      
      // Use extracted data or form input data
      const finalSkills = newCV.skills ? 
        newCV.skills.split(',').map(s => s.trim()) : 
        extractedSkills;
        
      const finalExperience = newCV.experience || extractedExperience;
      
      // Create new CV object
      const newCVObject: CV = {
        id: cvs.length + 1,
        userId: currentUser.id,
        fileName: cvFile.name,
        skills: finalSkills,
        experience: finalExperience,
        uploadedAt: new Date(),
        availability: true
      };
      
      // Save file data to CV object as a data URL for preview
      const dataUrl = await FileUtils.readFileAsDataURL(cvFile);
      (newCVObject as any).fileData = dataUrl;
      
      // Add to CVs list
      setCvs([...cvs, newCVObject]);
      
      // Reset form and close modal
      setNewCV({ fileName: '', skills: '', experience: '' });
      setCvFile(null);
      setFileError('');
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Error processing CV file:', error);
      setFileError('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDeleteCV = (cvId: number) => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      setCvs(cvs.filter(cv => cv.id !== cvId));
    }
  };

  const handleDownloadCV = (cv: CV) => {
    // Check if we have the file data stored in the CV object
    if ((cv as any).fileData) {
      // Create an anchor element and trigger download from data URL
      const link = document.createElement('a');
      link.href = (cv as any).fileData;
      link.download = cv.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // In case we don't have the actual file data
      alert(`In a production environment, this would download ${cv.fileName}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // Only accept PDF, DOC, DOCX, and TXT files
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      if (!validTypes.includes(file.type)) {
        setFileError('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
        setCvFile(null);
        return;
      }
      
      // Reset error if previously set
      setFileError('');
      
      // Update file state
      setCvFile(file);
      
      // Auto-fill filename if not already entered
      if (!newCV.fileName) {
        setNewCV(prev => ({ ...prev, fileName: file.name }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">CVs Database</h3>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Upload className="w-5 h-5" />
          <span>Upload CV</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search CVs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-all"
          >
            <Filter size={18} />
            <span>Filter by Skill</span>
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <div className="absolute z-10 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
              <div className="p-2">
                <div 
                  className={`px-4 py-2 cursor-pointer rounded ${!filterSkill ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                  onClick={() => { setFilterSkill(''); setShowFilters(false); }}
                >
                  All Skills
                </div>
                {allSkills.map((skill, idx) => (
                  <div 
                    key={idx}
                    className={`px-4 py-2 cursor-pointer rounded ${filterSkill === skill ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                    onClick={() => { setFilterSkill(skill); setShowFilters(false); }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CVs List */}
      {filteredCVs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVs.map(cv => (
            <div key={cv.id} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 flex flex-col">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">{cv.fileName}</h4>
                <p className="text-gray-400 text-sm mb-4">Uploaded: {cv.uploadedAt.toLocaleDateString()}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Experience:</p>
                  <p className="text-white">{cv.experience}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
                <div className="flex justify-between mt-5 pt-4 border-t border-gray-700">
                {(cv as any).fileData && (
                  <button
                    onClick={() => setPreviewCV(cv)}
                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                    title="Preview CV"
                  >
                    <FileText size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDownloadCV(cv)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Download CV"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCV(cv.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete CV"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400">No CVs found matching your search criteria.</p>
        </div>
      )}      {/* Upload CV Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Upload New CV</h3>
            <form onSubmit={handleUploadCV}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Upload CV File</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center space-x-2"
                  >
                    <FileText size={16} />
                    <span>Select File</span>
                  </button>
                  <span className="text-white text-sm truncate flex-1">
                    {cvFile ? cvFile.name : 'No file selected'}
                  </span>
                </div>
                {fileError && <p className="text-red-400 text-sm mt-1">{fileError}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newCV.skills}
                  onChange={(e) => setNewCV({...newCV, skills: e.target.value})}
                  placeholder="React, TypeScript, Node.js (or leave empty to extract from CV)"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Leave empty to auto-detect skills from CV</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Experience</label>
                <input
                  type="text"
                  value={newCV.experience}
                  onChange={(e) => setNewCV({...newCV, experience: e.target.value})}
                  placeholder="5 years (or leave empty to extract from CV)"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">Leave empty to auto-detect experience from CV</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setCvFile(null);
                    setFileError('');
                    setNewCV({ fileName: '', skills: '', experience: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {previewCV && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">{previewCV.fileName}</h3>
              <button
                onClick={() => setPreviewCV(null)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-white rounded-lg">
              {(previewCV as any).fileData && (
                <iframe 
                  src={(previewCV as any).fileData} 
                  className="w-full h-full min-h-[60vh]" 
                  title={previewCV.fileName}
                />
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewCV(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVsSection;
