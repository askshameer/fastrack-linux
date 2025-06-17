// Enhanced demo data for AI matching showcase

export const demoJobs = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    description: "We are looking for an experienced full stack developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate should have strong experience with React, Node.js, and cloud platforms. You will work in an agile environment and collaborate with cross-functional teams.",
    requiredSkills: ["React", "Node.js", "TypeScript", "AWS", "Docker", "PostgreSQL"],
    experienceLevel: "5+ years of professional software development experience",
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: "Data Scientist",
    description: "Join our data science team to build machine learning models and extract insights from large datasets. You will work with Python, TensorFlow, and cloud platforms to develop predictive models. The role involves working with business stakeholders to understand requirements and translate them into technical solutions.",
    requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL", "AWS", "Statistics"],
    experienceLevel: "3+ years in data science or machine learning",
    createdAt: new Date('2024-01-20')
  },
  {
    id: 3,
    title: "DevOps Engineer",
    description: "We need a DevOps engineer to help us scale our infrastructure and improve our deployment processes. You will work with Kubernetes, Docker, and CI/CD pipelines. Experience with monitoring and logging tools is essential. You will be responsible for maintaining high availability and performance of our production systems.",
    requiredSkills: ["Kubernetes", "Docker", "Jenkins", "AWS", "Terraform", "Monitoring"],
    experienceLevel: "4+ years in DevOps or infrastructure",
    createdAt: new Date('2024-01-25')
  },
  {
    id: 4,
    title: "Frontend Developer",
    description: "Looking for a creative frontend developer to build beautiful and responsive user interfaces. You will work with React, TypeScript, and modern CSS frameworks. The role involves collaborating with designers and backend developers to create seamless user experiences.",
    requiredSkills: ["React", "TypeScript", "CSS", "HTML", "JavaScript", "Figma"],
    experienceLevel: "2+ years frontend development experience",
    createdAt: new Date('2024-02-01')
  }
];

export const demoCVs = [
  {
    id: 1,
    userId: 2,
    fileName: "john_doe_cv.pdf",
    skills: ["React", "Node.js", "TypeScript", "JavaScript", "MongoDB", "Express", "Git"],
    experience: "Senior Software Engineer with 6 years of experience in full stack web development. Led multiple projects using React and Node.js. Experienced in agile methodologies and team leadership. Built scalable web applications serving thousands of users.",
    uploadedAt: new Date('2024-01-10'),
    availability: true
  },
  {
    id: 2,
    userId: 3,
    fileName: "sarah_smith_cv.pdf", 
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Jupyter", "Statistics"],
    experience: "Data Scientist with 4 years of experience in machine learning and analytics. Built predictive models for customer behavior and fraud detection. Experienced with deep learning, natural language processing, and statistical analysis. PhD in Computer Science.",
    uploadedAt: new Date('2024-01-12'),
    availability: true
  },
  {
    id: 3,
    userId: 4,
    fileName: "mike_johnson_cv.pdf",
    skills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux", "Python"],
    experience: "DevOps Engineer with 5 years of experience in cloud infrastructure and automation. Managed production systems serving millions of users. Expert in containerization, orchestration, and CI/CD pipelines. Strong background in system administration and monitoring.",
    uploadedAt: new Date('2024-01-14'),
    availability: true
  },
  {
    id: 4,
    userId: 5,
    fileName: "emily_chen_cv.pdf",
    skills: ["React", "Vue.js", "TypeScript", "CSS", "HTML", "Figma", "JavaScript"],
    experience: "Frontend Developer with 3 years of experience creating responsive and accessible web applications. Specialized in React and Vue.js ecosystems. Strong eye for design and user experience. Collaborated with UX designers and backend teams on multiple successful projects.",
    uploadedAt: new Date('2024-01-16'),
    availability: true
  },
  {
    id: 5,
    userId: 6,
    fileName: "alex_rodriguez_cv.pdf",
    skills: ["Java", "Spring Boot", "MySQL", "REST API", "Microservices", "Git"],
    experience: "Backend Developer with 2 years of experience in Java and Spring framework. Built RESTful APIs and microservices architecture. Experienced with database design and optimization. Fresh graduate with strong fundamentals in software engineering.",
    uploadedAt: new Date('2024-01-18'),
    availability: true
  },
  {
    id: 6,
    userId: 7,
    fileName: "lisa_wang_cv.pdf",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "AWS", "Docker"],
    experience: "Full Stack Developer with 4 years of experience in Python and web development. Built e-commerce platforms and content management systems. Strong background in database design and API development. Experience with both startups and enterprise environments.",
    uploadedAt: new Date('2024-01-20'),
    availability: true
  }
];

export const demoUsers = [
  { id: 1, email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 2, email: 'john@example.com', password: 'user123', role: 'user', name: 'John Doe', availability: true },
  { id: 3, email: 'sarah@example.com', password: 'user123', role: 'user', name: 'Sarah Smith', availability: true },
  { id: 4, email: 'mike@example.com', password: 'user123', role: 'user', name: 'Mike Johnson', availability: true },
  { id: 5, email: 'emily@example.com', password: 'user123', role: 'user', name: 'Emily Chen', availability: true },
  { id: 6, email: 'alex@example.com', password: 'user123', role: 'user', name: 'Alex Rodriguez', availability: true },
  { id: 7, email: 'lisa@example.com', password: 'user123', role: 'user', name: 'Lisa Wang', availability: true }
];

// Test questions for different skill areas
export const demoQuestions = [
  { id: 1, question: 'What is React?', options: ['A database', 'A JavaScript library', 'A CSS framework', 'A testing tool'], correct: 1 },
  { id: 2, question: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Process Interface', 'Advanced Process Interface'], correct: 0 },
  { id: 3, question: 'Which of these is a NoSQL database?', options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'], correct: 2 },
  { id: 4, question: 'What is Docker used for?', options: ['Database management', 'Containerization', 'Version control', 'Code editing'], correct: 1 },
  { id: 5, question: 'What is machine learning?', options: ['A type of database', 'A subset of AI', 'A programming language', 'A web framework'], correct: 1 },
  { id: 6, question: 'What does CI/CD stand for?', options: ['Continuous Integration/Continuous Deployment', 'Code Integration/Code Deployment', 'Central Integration/Central Deployment', 'Custom Integration/Custom Deployment'], correct: 0 },
  { id: 7, question: 'What is TypeScript?', options: ['A new programming language', 'A superset of JavaScript', 'A database query language', 'A CSS preprocessor'], correct: 1 },
  { id: 8, question: 'What is Kubernetes?', options: ['A programming language', 'A database', 'A container orchestration platform', 'A web server'], correct: 2 }
];