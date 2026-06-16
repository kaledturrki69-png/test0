// API types for candidates and resumes

export interface Photo {
  filename: string;
  base64: string;
}

export interface CandidateAPI {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email1: string;
  email2: string;
  phone1: string;
  phone2: string;
  photo?: Photo | null;
  location: string;
  company: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateCreateRequest {
  first_name: string;
  last_name: string;
  email1: string;
  email2?: string;
  phone1: string;
  phone2?: string;
  location: string;
}

export interface CandidateUpdateRequest {
  first_name?: string;
  last_name?: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
  location?: string;
}

export interface ResumeAPI {
  id: number;
  candidate: CandidateAPI;
  json_data: ResumeJsonData;
  source: string;
  company: number;
  document: number;
  schema_version: string;
  created_at: string;
}

export interface ResumeCreateRequest {
  candidate_id: number;
  json_data: ResumeJsonData;
  source: string;
  document: number;
  schema_version: string;
}

export interface ResumeUpdateRequest {
  candidate_id?: number;
  json_data?: ResumeJsonData;
  source?: string;
  document?: number;
  schema_version?: string;
}

// Resume JSON data structure based on the example
export interface ResumeJsonData {
  name: string;
  email: string;
  phone: string;
  title: string;
  summary: Array<{
    status: string;
    summary: string;
  }>;
  linkedin?: string;
  location: string;
  mobility?: string;
  education: Array<{
    school: string;
    degrees: Array<{
      from_: string;
      to: string;
      major: string;
      degree: string;
      status: string;
    }>;
  }>;
  languages: Array<{
    language: string;
    level: string;
    status: string;
  }>;
  experience: Array<{
    company: string;
    positions: Array<{
      title: string;
      from_: string;
      to: string;
      responsibilities: Array<{
        description: string;
        status: string;
      }>;
      skillsUsed: {
        technologies: Array<{
          name: string;
          status: string;
        }>;
      };
    }>;
  }>;
}
