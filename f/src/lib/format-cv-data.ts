import { Candidate } from '@/data/candidates';
import { ResumeAPI } from '@/types/candidate-api';

/**
 * Helper function to format candidate data for CVTemplate component
 */
export function formatCandidateForCV(data: {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email1?: string;
  phone1?: string;
  location?: string;
  position?: string;
  tags?: string[];
  description?: string;
  skills?: string[];
  languages?: string[];
  resume?: ResumeAPI;
  avatar?: string;
}): Candidate {
  const resume = data.resume;

  return {
    id: data.id,
    name: data.full_name || `${data.first_name} ${data.last_name}`,
    position: data.position || resume?.json_data?.title || 'No position',
    title: resume?.json_data?.title || data.position || 'No title',
    email: data.email1 || 'No email',
    phone: data.phone1 || 'No phone',
    linkedin: resume?.json_data?.linkedin || 'No linkedin',
    avatar: data.avatar || '',
    category: data.location || 'No location',
    tags: data.tags || [],
    description:
      data.description ||
      resume?.json_data?.summary?.[0]?.summary ||
      'No description',
    experience:
      resume?.json_data?.experience?.map((exp) => ({
        title: exp.positions?.[0]?.title || 'No title',
        company: exp.company,
        years: `${exp.positions?.[0]?.from_ || ''} - ${exp.positions?.[0]?.to || ''}`,
        description:
          exp.positions?.[0]?.responsibilities?.[0]?.description ||
          'No description',
        dateFrom: {
          year: exp.positions?.[0]?.from_ || '',
          month: ''
        },
        dateTo: {
          year: exp.positions?.[0]?.to || '',
          month: ''
        }
      })) || [],
    education:
      resume?.json_data?.education?.map((edu) => ({
        degree: edu.degrees?.[0]?.degree || 'No degree',
        institution: edu.school,
        years: `${edu.degrees?.[0]?.from_ || ''} - ${edu.degrees?.[0]?.to || ''}`,
        dateFrom: {
          year: edu.degrees?.[0]?.from_ || '',
          month: ''
        },
        dateTo: {
          year: edu.degrees?.[0]?.to || '',
          month: ''
        }
      })) || [],
    languages:
      data.languages ||
      resume?.json_data?.languages?.map((lang) => lang.language) ||
      [],
    skills:
      data.skills ||
      resume?.json_data?.experience?.flatMap(
        (exp) =>
          exp.positions?.flatMap(
            (pos) =>
              pos.skillsUsed?.technologies?.map((tech) => tech.name) || []
          ) || []
      ) ||
      []
  };
}
