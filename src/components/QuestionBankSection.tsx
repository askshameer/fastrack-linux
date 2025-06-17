import React, { useState, useRef } from 'react';
import { HelpCircle, Upload, Download, Trash2, Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Question } from '../types';

interface QuestionBankSectionProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionBankSection: React.FC<QuestionBankSectionProps> = ({
  questions,
  setQuestions
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setUploadError('CSV file must contain at least a header row and one question');
        setIsUploading(false);
        return;
      }

      // Parse CSV
      const newQuestions: Question[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Skip header row (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          // Parse CSV line - handle quoted values
          const values = parseCSVLine(line);
          
          if (values.length < 6) {
            console.warn(`Line ${i + 1}: Not enough columns (expected 6, got ${values.length})`);
            errorCount++;
            continue;
          }

          const [questionText, option1, option2, option3, option4, correctAnswer] = values;
          
          // Validate required fields
          if (!questionText.trim() || !option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
            console.warn(`Line ${i + 1}: Missing required fields`);
            errorCount++;
            continue;
          }

          // Parse correct answer (should be 1, 2, 3, or 4)
          const correctIndex = parseInt(correctAnswer.trim()) - 1;
          if (correctIndex < 0 || correctIndex > 3) {
            console.warn(`Line ${i + 1}: Correct answer must be 1, 2, 3, or 4`);
            errorCount++;
            continue;
          }

          // Get next question ID
          const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 0;
          const questionId = maxId + newQuestions.length + 1;

          newQuestions.push({
            id: questionId,
            question: questionText.trim(),
            options: [option1.trim(), option2.trim(), option3.trim(), option4.trim()],
            correct: correctIndex
          });

          successCount++;
        } catch (error) {
          console.warn(`Line ${i + 1}: Parse error`, error);
          errorCount++;
        }
      }

      if (newQuestions.length > 0) {
        setQuestions([...questions, ...newQuestions]);
        setUploadSuccess(`Successfully uploaded ${successCount} questions${errorCount > 0 ? ` (${errorCount} errors)` : ''}`);
      } else {
        setUploadError('No valid questions found in the CSV file');
      }

    } catch (error) {
      setUploadError('Error reading CSV file. Please check the format.');
      console.error('CSV upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Parse CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const handleDeleteSelected = () => {
    if (selectedQuestions.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      setUploadSuccess(`Deleted ${selectedQuestions.length} question(s)`);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `Question,Option 1,Option 2,Option 3,Option 4,Correct Answer
"What is React?","A database","A JavaScript library","A CSS framework","A testing tool",2
"What does API stand for?","Application Programming Interface","Advanced Programming Interface","Application Process Interface","Advanced Process Interface",1
"Which of these is a NoSQL database?","MySQL","PostgreSQL","MongoDB","SQLite",3`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-green-400" />
            <span>Question Bank</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Upload MCQ questions via CSV format
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={downloadCSVTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Template</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            disabled={isUploading}
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-200">{uploadSuccess}</p>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-200">{uploadError}</p>
        </div>
      )}

      {/* CSV Format Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">CSV Format Requirements:</h4>
        <div className="text-blue-200 text-sm space-y-1">
          <p>• <strong>Column Order:</strong> Question, Option 1, Option 2, Option 3, Option 4, Correct Answer</p>
          <p>• <strong>Correct Answer:</strong> Use numbers 1, 2, 3, or 4 (corresponding to option position)</p>
          <p>• <strong>Quotes:</strong> Use double quotes around text containing commas</p>
          <p>• <strong>Header Row:</strong> Include a header row (will be skipped during import)</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {selectedQuestions.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedQuestions.length})</span>
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h4 className="text-lg font-semibold text-white">
            Questions ({filteredQuestions.length})
          </h4>
          {filteredQuestions.length > 0 && (
            <button
              onClick={selectAllQuestions}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {selectedQuestions.length === filteredQuestions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        
        {filteredQuestions.length > 0 ? (
          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {filteredQuestions.map((question, index) => (
              <div 
                key={question.id} 
                className={`p-4 hover:bg-gray-700/30 transition-colors ${
                  selectedQuestions.includes(question.id) ? 'bg-green-500/10' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-white mb-2">
                        {index + 1}. {question.question}
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === question.correct 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-gray-700/50 text-gray-300'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optionIndex)}:</span> {option}
                          {optionIndex === question.correct && (
                            <CheckCircle className="inline w-4 h-4 ml-2 text-green-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">
              {questions.length === 0 ? 'No questions in the bank yet.' : 'No questions match your search.'}
            </p>
            <p className="text-sm">Upload a CSV file to add MCQ questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankSection;