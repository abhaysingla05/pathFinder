// constants/learningPaths.ts
export const LEARNING_PATHS: Record<string, { focusAreas: string[], subTopics: string[] }> = {
    'Web Development': {
      focusAreas: ['Front-end', 'Back-end', 'Full-stack', 'UI/UX Design', 'Web Security', 'Performance Optimization'],
      subTopics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases', 'APIs']
    },
    'Data Science': {
      focusAreas: ['Data Analysis', 'Machine Learning', 'Data Visualization', 'Big Data', 'Statistical Analysis', 'Deep Learning'],
      subTopics: ['Python', 'R', 'SQL', 'TensorFlow', 'Data Mining', 'NLP']
    },
    'Mobile Development': {
      focusAreas: ['iOS Development', 'Android Development', 'Cross-Platform', 'Mobile UI/UX', 'App Security'],
      subTopics: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Mobile Architecture']
    },
    'Cloud Computing': {
      focusAreas: ['AWS', 'Azure', 'Google Cloud', 'DevOps', 'Cloud Security', 'Serverless'],
      subTopics: ['Infrastructure as Code', 'Containers', 'Microservices', 'Cloud Architecture']
    },
    'Digital Marketing': {
      focusAreas: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Paid Advertising', 'Email Marketing'],
      subTopics: ['Analytics', 'Marketing Strategy', 'Brand Management', 'Marketing Automation']
    },
    'Artificial Intelligence': {
      focusAreas: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Robotics'],
      subTopics: ['Neural Networks', 'Reinforcement Learning', 'AI Ethics', 'AI Applications']
    },
    'Cybersecurity': {
      focusAreas: ['Network Security', 'Application Security', 'Ethical Hacking', 'Security Operations'],
      subTopics: ['Cryptography', 'Threat Analysis', 'Incident Response', 'Security Tools']
    }
  } as const;
  
  export const generateCustomFocusAreas = (goal: string): string[] => {
    // Generate focus areas for custom goals using AI or predefined logic
    const defaultAreas = [
      'Fundamentals',
      'Advanced Concepts',
      'Practical Applications',
      'Industry Best Practices',
      'Specialized Topics'
    ];
    
    return defaultAreas;
  };