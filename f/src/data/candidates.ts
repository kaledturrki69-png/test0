// Candidate data structure and mock data
export interface Candidate {
  id: number;
  name: string;
  position: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  score?: number;
  avatar: string;
  category: string;
  tags: string[];
  description: string;
  experience: Array<{
    title: string;
    company: string;
    years: string;
    description: string;
    dateFrom: { year: string; month: string };
    dateTo: { year: string; month: string };
  }>;
  education: Array<{
    degree: string;
    institution: string;
    years: string;
    dateFrom: { year: string; month: string };
    dateTo: { year: string; month: string };
  }>;
  languages: string[];
  skills: string[];
}

export const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: 'John Doe',
    position: 'Software Engineer',
    title: 'Full Stack Developer',
    email: 'john.doe@email.com',
    phone: '0781713040',
    linkedin: 'https://linkedin.com/in/johndoe',
    score: 90,
    avatar: '',
    category: 'cadre moyen',
    tags: ['react', 'node.js', 'full stack'],
    description:
      'Passionate full-stack developer with 5 years of experience in JavaScript, React, Node.js, and databases.',
    experience: [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        years: '2020 - Present',
        description:
          'Developing and maintaining web applications using React, Node.js, and MongoDB.',
        dateFrom: { year: '2020', month: 'January' },
        dateTo: { year: '', month: '' }
      },
      {
        title: 'Junior Developer',
        company: 'StartUp Inc',
        years: '2018 - 2020',
        description:
          'Assisted in building a customer portal using Angular and Firebase.',
        dateFrom: { year: '2018', month: 'June' },
        dateTo: { year: '2020', month: 'December' }
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'State University',
        years: '2014 - 2018',
        dateFrom: { year: '2014', month: 'September' },
        dateTo: { year: '2018', month: 'May' }
      }
    ],
    languages: ['English', 'Spanish'],
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS']
  },
  {
    id: 2,
    name: 'Jane Smith',
    position: 'Data Scientist',
    title: 'Senior Data Scientist',
    email: 'jane.smith@email.com',
    phone: '0781713041',
    linkedin: 'https://linkedin.com/in/janesmith',
    score: 88,
    avatar: '',
    category: 'cadre supérieur',
    tags: ['python', 'data analysis', 'machine learning'],
    description:
      'Experienced Data Scientist with a focus on predictive modeling and machine learning techniques.',
    experience: [
      {
        title: 'Data Scientist',
        company: 'Data Solutions',
        years: '2019 - Present',
        description:
          'Built machine learning models for data-driven decision-making.',
        dateFrom: { year: '2019', month: 'March' },
        dateTo: { year: '', month: '' }
      },
      {
        title: 'Junior Data Analyst',
        company: 'Insight Analytics',
        years: '2017 - 2019',
        description:
          'Analyzed large datasets to provide actionable insights for business growth.',
        dateFrom: { year: '2017', month: 'January' },
        dateTo: { year: '2019', month: 'February' }
      }
    ],
    education: [
      {
        degree: "Master's in Data Science",
        institution: 'Tech University',
        years: '2015 - 2017',
        dateFrom: { year: '2015', month: 'September' },
        dateTo: { year: '2017', month: 'May' }
      },
      {
        degree: "Bachelor's in Statistics",
        institution: 'State College',
        years: '2011 - 2015',
        dateFrom: { year: '2011', month: 'September' },
        dateTo: { year: '2015', month: 'May' }
      }
    ],
    languages: ['English', 'French'],
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization']
  },
  {
    id: 3,
    name: 'Michael Johnson',
    position: 'Product Manager',
    title: 'Senior Product Manager',
    email: 'michael.johnson@email.com',
    phone: '0781713042',
    linkedin: 'https://linkedin.com/in/michaeljohnson',
    score: 85,
    avatar: '',
    category: 'cadre supérieur',
    tags: ['product management', 'agile', 'strategy'],
    description:
      'Strategic product manager with 7 years of experience in leading cross-functional teams and driving product growth.',
    experience: [
      {
        title: 'Senior Product Manager',
        company: 'Tech Innovations',
        years: '2021 - Present',
        description:
          'Leading product strategy and roadmap for enterprise software solutions.',
        dateFrom: { year: '2021', month: 'January' },
        dateTo: { year: '', month: '' }
      },
      {
        title: 'Product Manager',
        company: 'Digital Solutions',
        years: '2018 - 2021',
        description:
          'Managed product lifecycle from conception to launch for mobile applications.',
        dateFrom: { year: '2018', month: 'March' },
        dateTo: { year: '2021', month: 'December' }
      }
    ],
    education: [
      {
        degree: 'MBA in Technology Management',
        institution: 'Business School',
        years: '2016 - 2018',
        dateFrom: { year: '2016', month: 'September' },
        dateTo: { year: '2018', month: 'May' }
      },
      {
        degree: "Bachelor's in Computer Science",
        institution: 'University of Technology',
        years: '2012 - 2016',
        dateFrom: { year: '2012', month: 'September' },
        dateTo: { year: '2016', month: 'May' }
      }
    ],
    languages: ['English', 'German'],
    skills: [
      'Product Strategy',
      'Agile',
      'User Research',
      'Analytics',
      'Leadership'
    ]
  }
];
