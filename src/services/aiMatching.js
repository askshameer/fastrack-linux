import { HfInference } from '@huggingface/inference';

class AIMatchingService {
  constructor(apiToken) {
    this.hf = new HfInference(apiToken);
    this.cache = new Map(); // Simple cache to avoid repeated API calls
  }

  // Traditional keyword-based matching (fast baseline)
  calculateKeywordMatch(cv, job) {
    const cvSkills = this.extractSkills(cv.skills.join(' ') + ' ' + cv.experience);
    const jobSkills = this.extractSkills(job.requiredSkills.join(' ') + ' ' + job.description);
    
    const commonSkills = cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const keywordScore = Math.min(100, (commonSkills.length / Math.max(jobSkills.length, 1)) * 100);
    
    return {
      score: keywordScore,
      matchedSkills: commonSkills,
      missingSkills: jobSkills.filter(skill => 
        !cvSkills.some(cvSkill => 
          cvSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cvSkill.toLowerCase())
        )
      ),
      method: 'keyword'
    };
  }

  extractSkills(text) {
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'typescript', 'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'docker', 'kubernetes', 'git', 'linux', 'windows',
      'machine learning', 'ai', 'data science', 'analytics', 'tensorflow',
      'pytorch', 'pandas', 'numpy', 'r', 'scala', 'spark', 'hadoop',
      'devops', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'prometheus',
      'elasticsearch', 'redis', 'graphql', 'rest api', 'microservices',
      'agile', 'scrum', 'project management', 'leadership', 'communication'
    ];
    
    const words = text.toLowerCase().split(/[\s,.-]+/);
    return techSkills.filter(skill => 
      words.some(word => word.includes(skill.toLowerCase()) || skill.toLowerCase().includes(word))
    );
  }

  // AI-powered semantic analysis using free Hugging Face models
  async analyzeSemanticMatch(cv, job) {
    const cacheKey = `${cv.id}_${job.id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Prepare text for analysis
      const cvText = `Experience: ${cv.experience}. Skills: ${cv.skills.join(', ')}`;
      const jobText = `Job: ${job.title}. Requirements: ${job.description}. Required skills: ${job.requiredSkills.join(', ')}. Experience level: ${job.experienceLevel}`;

      // Use sentence similarity model (free)
      const similarity = await this.calculateSentenceSimilarity(cvText, jobText);

      // Use text classification for experience level matching
      const experienceMatch = await this.analyzeExperienceMatch(cv, job);

      // Use zero-shot classification for skills categorization
      const skillsAnalysis = await this.analyzeSkillsAlignment(cv, job);

      const semanticResult = {
        overallScore: Math.round((similarity * 0.4 + experienceMatch * 0.3 + skillsAnalysis.score * 0.3)),
        similarity: Math.round(similarity),
        experienceMatch: Math.round(experienceMatch),
        skillsAlignment: skillsAnalysis,
        confidence: this.calculateConfidence(similarity, experienceMatch, skillsAnalysis.score),
        reasoning: this.generateReasoning(similarity, experienceMatch, skillsAnalysis),
        method: 'ai_semantic'
      };

      this.cache.set(cacheKey, semanticResult);
      return semanticResult;

    } catch (error) {
      console.warn('AI analysis failed, falling back to keyword matching:', error);
      return {
        overallScore: 0,
        similarity: 0,
        experienceMatch: 0,
        skillsAlignment: { score: 0, categories: [] },
        confidence: 0,
        reasoning: 'AI analysis unavailable - using keyword matching only',
        method: 'fallback',
        error: error.message
      };
    }
  }

  async calculateSentenceSimilarity(text1, text2) {
    try {
      // Use sentence-transformers model for semantic similarity
      const embeddings1 = await this.hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text1
      });
      
      const embeddings2 = await this.hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2', 
        inputs: text2
      });

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(embeddings1, embeddings2);
      return Math.max(0, Math.min(100, similarity * 100));
    } catch (error) {
      console.warn('Similarity calculation failed:', error);
      return 50; // Default moderate score
    }
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async analyzeExperienceMatch(cv, job) {
    try {
      // Extract years of experience from CV and job requirement
      const cvYears = this.extractYearsOfExperience(cv.experience);
      const requiredYears = this.extractYearsOfExperience(job.experienceLevel);

      if (cvYears === 0 || requiredYears === 0) {
        // Use text classification if we can't extract numbers
        const result = await this.hf.zeroShotClassification({
          model: 'facebook/bart-large-mnli',
          inputs: `Candidate experience: ${cv.experience}`,
          parameters: {
            candidate_labels: ['entry level', 'mid level', 'senior level', 'expert level']
          }
        });

        const jobLevel = this.categorizeJobLevel(job.experienceLevel);
        const cvLevel = result.labels[0];
        
        return this.matchExperienceLevels(cvLevel, jobLevel);
      }

      // Calculate experience match based on years
      if (cvYears >= requiredYears) {
        return Math.min(100, 80 + (cvYears - requiredYears) * 2); // Bonus for extra experience
      } else {
        return Math.max(20, (cvYears / requiredYears) * 80); // Penalty for less experience
      }
    } catch (error) {
      console.warn('Experience analysis failed:', error);
      return 60; // Default moderate score
    }
  }

  extractYearsOfExperience(text) {
    const yearMatches = text.match(/(\d+)\s*(?:years?|yrs?)/i);
    return yearMatches ? parseInt(yearMatches[1]) : 0;
  }

  categorizeJobLevel(experienceLevel) {
    const level = experienceLevel.toLowerCase();
    if (level.includes('senior') || level.includes('lead') || level.includes('principal')) return 'senior level';
    if (level.includes('mid') || level.includes('intermediate')) return 'mid level';
    if (level.includes('junior') || level.includes('entry') || level.includes('graduate')) return 'entry level';
    return 'mid level'; // default
  }

  matchExperienceLevels(cvLevel, jobLevel) {
    const levelMap = { 'entry level': 1, 'mid level': 2, 'senior level': 3, 'expert level': 4 };
    const cvScore = levelMap[cvLevel] || 2;
    const jobScore = levelMap[jobLevel] || 2;
    
    if (cvScore >= jobScore) {
      return Math.min(100, 80 + (cvScore - jobScore) * 10);
    } else {
      return Math.max(30, (cvScore / jobScore) * 80);
    }
  }

  async analyzeSkillsAlignment(cv, job) {
    try {
      const cvSkills = cv.skills.join(', ');
      const jobSkills = job.requiredSkills.join(', ');

      // Categorize skills using zero-shot classification
      const skillCategories = await this.hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: cvSkills,
        parameters: {
          candidate_labels: [
            'frontend development',
            'backend development', 
            'full stack development',
            'data science',
            'machine learning',
            'devops',
            'mobile development',
            'cloud computing',
            'database management',
            'project management'
          ]
        }
      });

      // Calculate alignment score based on skill categories
      const topCategories = skillCategories.labels.slice(0, 3);
      const scores = skillCategories.scores.slice(0, 3);
      const alignmentScore = scores.reduce((sum, score) => sum + score, 0) / scores.length * 100;

      return {
        score: Math.round(alignmentScore),
        categories: topCategories.map((category, index) => ({
          category,
          confidence: Math.round(scores[index] * 100)
        }))
      };
    } catch (error) {
      console.warn('Skills analysis failed:', error);
      return { score: 50, categories: [] };
    }
  }

  calculateConfidence(similarity, experienceMatch, skillsScore) {
    const avgScore = (similarity + experienceMatch + skillsScore) / 3;
    const variance = Math.pow(similarity - avgScore, 2) + 
                    Math.pow(experienceMatch - avgScore, 2) + 
                    Math.pow(skillsScore - avgScore, 2);
    const standardDev = Math.sqrt(variance / 3);
    
    // Higher confidence when scores are consistent (low standard deviation)
    return Math.max(30, Math.min(100, 100 - standardDev));
  }

  generateReasoning(similarity, experienceMatch, skillsAnalysis) {
    const reasons = [];
    
    if (similarity > 70) {
      reasons.push("Strong semantic similarity between CV and job description");
    } else if (similarity > 40) {
      reasons.push("Moderate alignment between candidate background and role requirements");
    } else {
      reasons.push("Limited semantic alignment - candidate may need upskilling");
    }

    if (experienceMatch > 80) {
      reasons.push("Experience level exceeds job requirements");
    } else if (experienceMatch > 60) {
      reasons.push("Experience level matches job requirements well");
    } else {
      reasons.push("Experience level below job requirements");
    }

    if (skillsAnalysis.score > 70) {
      reasons.push(`Strong skills alignment in ${skillsAnalysis.categories[0]?.category || 'relevant areas'}`);
    } else if (skillsAnalysis.score > 40) {
      reasons.push("Moderate skills alignment with some gaps");
    } else {
      reasons.push("Significant skills gap identified");
    }

    return reasons;
  }

  // Main hybrid matching function
  async calculateHybridMatch(cv, job) {
    // 1. Fast keyword matching (always available)
    const keywordResult = this.calculateKeywordMatch(cv, job);
    
    // 2. AI semantic analysis (with fallback)
    const aiResult = await this.analyzeSemanticMatch(cv, job);
    
    // 3. Combine scores with intelligent weighting
    const keywordWeight = aiResult.confidence > 50 ? 0.3 : 0.7; // More weight on keywords if AI is uncertain
    const aiWeight = 1 - keywordWeight;
    
    const finalScore = Math.round(
      (keywordResult.score * keywordWeight) + (aiResult.overallScore * aiWeight)
    );

    return {
      finalScore,
      confidence: Math.round((aiResult.confidence + 70) / 2), // Blend AI confidence with keyword reliability
      breakdown: {
        keyword: keywordResult,
        ai: aiResult,
        weights: { keyword: keywordWeight, ai: aiWeight }
      },
      insights: {
        strengths: this.identifyStrengths(keywordResult, aiResult),
        gaps: this.identifyGaps(keywordResult, aiResult),
        recommendations: this.generateRecommendations(keywordResult, aiResult, finalScore)
      },
      interviewFocus: this.generateInterviewQuestions(cv, job, finalScore)
    };
  }

  identifyStrengths(keywordResult, aiResult) {
    const strengths = [];
    
    if (keywordResult.matchedSkills.length > 0) {
      strengths.push(`Strong technical skills: ${keywordResult.matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    if (aiResult.experienceMatch > 70) {
      strengths.push("Experience level aligns well with role requirements");
    }
    
    if (aiResult.skillsAlignment?.categories?.length > 0) {
      const topCategory = aiResult.skillsAlignment.categories[0];
      strengths.push(`Expertise in ${topCategory.category} (${topCategory.confidence}% confidence)`);
    }
    
    return strengths;
  }

  identifyGaps(keywordResult, aiResult) {
    const gaps = [];
    
    if (keywordResult.missingSkills.length > 0) {
      gaps.push(`Missing key skills: ${keywordResult.missingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (aiResult.experienceMatch < 50) {
      gaps.push("Experience level below job requirements");
    }
    
    if (aiResult.similarity < 40) {
      gaps.push("Limited background alignment with role context");
    }
    
    return gaps;
  }

  generateRecommendations(keywordResult, aiResult, finalScore) {
    const recommendations = [];
    
    if (finalScore > 80) {
      recommendations.push("Excellent candidate - proceed to technical interview");
      recommendations.push("Focus on cultural fit and team dynamics");
    } else if (finalScore > 60) {
      recommendations.push("Good candidate - assess specific skill gaps in interview");
      recommendations.push("Consider for role with some additional training");
    } else if (finalScore > 40) {
      recommendations.push("Potential candidate - requires significant upskilling");
      recommendations.push("Suitable for junior version of role or with mentorship");
    } else {
      recommendations.push("Poor fit for current role requirements");
      recommendations.push("Consider for different positions or future opportunities");
    }
    
    return recommendations;
  }

  generateInterviewQuestions(cv, job, score) {
    const questions = [];
    
    // Always include basic questions
    questions.push(`Tell me about your experience with ${job.requiredSkills[0] || 'the required technologies'}`);
    
    if (score > 70) {
      questions.push("What's the most challenging project you've worked on recently?");
      questions.push("How do you stay updated with latest technologies in your field?");
    } else {
      questions.push("How would you approach learning new technologies required for this role?");
      questions.push("Can you walk me through a project where you had to quickly learn new skills?");
    }
    
    // Add specific technical questions based on job requirements
    if (job.requiredSkills.includes('react') || job.requiredSkills.includes('React')) {
      questions.push("Explain the difference between class components and functional components in React");
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  }
}

export default AIMatchingService;