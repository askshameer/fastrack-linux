import * as FileSaver from 'file-saver';

/**
 * Simplified text processing utility for matching CVs with jobs
 * This class handles document processing and similarity calculations without external dependencies
 */
export class TextMatcher {
  /**
   * Preprocess text for better matching (lowercase, remove extra spaces)
   * @param text Text to preprocess
   * @returns Preprocessed text
   */
  preprocessText(text: string): string {
    // Convert to lowercase and remove extra spaces
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }
  
  /**
   * Calculate match percentage between job requirements and CV
   * @param jobDescription Job description and requirements
   * @param cvText CV text content
   * @returns Match percentage (0-100)
   */
  calculateMatchPercentage(jobDescription: string, cvText: string): number {
    const jobText = this.preprocessText(jobDescription);
    const candidateText = this.preprocessText(cvText);
    
    // Extract key terms from job description
    const terms = this.extractSignificantTerms(jobText);
    
    if (terms.length === 0) {
      return 0;
    }
    
    // Count matching terms
    let matchCount = 0;
    terms.forEach(term => {
      if (candidateText.includes(term)) {
        matchCount++;
      }
    });
    
    // Calculate percentage
    return Math.round((matchCount / terms.length) * 100);
  }
  
  /**
   * Simple term extraction for significant words
   * @param text Input text
   * @returns Array of significant terms
   */
  extractSignificantTerms(text: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'of', 'from',
      'this', 'that', 'these', 'those', 'it', 'its', 'we', 'they', 'he', 'she',
      'you', 'your', 'our', 'their', 'has', 'have', 'had', 'been', 'be', 'will',
      'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall'
    ]);
    
    // Split by non-word characters and filter out stop words and short terms
    const words = text.split(/\W+/).filter(word => 
      word.length > 2 && !stopWords.has(word.toLowerCase())
    );
    
    // Return unique terms
    return Array.from(new Set(words));
  }
}

/**
 * File utilities for handling CV uploads and downloads
 */
export class FileUtils {
  /**
   * Read a file as text
   * @param file File object
   * @returns Promise with file contents as text
   */
  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
  
  /**
   * Read a file as data URL (for PDF preview)
   * @param file File object
   * @returns Promise with file contents as data URL
   */
  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Save file from blob
   * @param blob Blob data
   * @param filename Name for the downloaded file
   */
  static saveFile(blob: Blob, filename: string): void {
    FileSaver.saveAs(blob, filename);
  }
}

/**
 * Utility to parse CV content and extract structured information
 */
export class CVParser {
  /**
   * Extract skills from CV text using basic keyword matching
   * @param text CV text content
   * @returns Array of identified skills
   */
  static extractSkills(text: string): string[] {
    // Common technical skills to look for
    const commonSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express',
      'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'php', 'laravel',
      'ruby', 'rails', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'react native',
      'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
      'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'dynamodb', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'agile', 'scrum', 'kanban',
      'rest', 'graphql', 'websocket', 'oauth', 'jwt', 'microservices', 'serverless',
      'data science', 'machine learning', 'ai', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
      'blockchain', 'web3', 'ethereum', 'solidity', 'smart contracts',
      'product management', 'project management', 'leadership', 'team management',
      'ux', 'ui', 'user research', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator'
    ];
    
    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => lowerText.includes(skill.toLowerCase()));
  }
  
  /**
   * Attempt to extract years of experience from CV text
   * @param text CV text content
   * @returns Experience string (e.g., "5 years")
   */
  static extractExperience(text: string): string {
    // Look for patterns like "X years of experience"
    const experiencePattern = /(\d+)\+?\s*years?\s+(of\s+)?(experience|exp)/i;
    const match = text.match(experiencePattern);
    
    if (match && match[1]) {
      return `${match[1]} years`;
    }
    
    return "Not specified";
  }
  
  /**
   * Basic function to clean and structure CV text
   * @param text Raw CV text
   * @returns Cleaned text
   */
  static cleanText(text: string): string {
    // Remove extra whitespace
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }
}
