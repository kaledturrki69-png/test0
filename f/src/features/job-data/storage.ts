export type Skill = {
  id: string;
  name: string;
  description: string;
};

export type Condition = {
  id: string;
  name: string;
  description: string;
  formule?: string;
};

export type JobFile = {
  id: string;
  name: string;
  description: string;
  lieu: string;
  date: string;
  nombrePersonnes: number;
  nombreCvShortlist: number;
  softPriorities: Record<string, number>;
  hardPriorities: Record<string, number>;
  conditions: string[];
  status: 'open' | 'closed';
};

const LS_SOFT_SKILLS = 'soft_skills';
const LS_HARD_SKILLS = 'hard_skills';
const LS_CONDITIONS = 'conditions_list';
const LS_JOBFILES = 'job_files';

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Soft skills
  listSoftSkills(): Skill[] {
    return readArray<Skill>(LS_SOFT_SKILLS);
  },
  saveSoftSkill(skill: Skill) {
    const list = readArray<Skill>(LS_SOFT_SKILLS);
    writeArray(LS_SOFT_SKILLS, [...list, skill]);
  },

  // Hard skills
  listHardSkills(): Skill[] {
    return readArray<Skill>(LS_HARD_SKILLS);
  },
  saveHardSkill(skill: Skill) {
    const list = readArray<Skill>(LS_HARD_SKILLS);
    writeArray(LS_HARD_SKILLS, [...list, skill]);
  },

  // Conditions
  listConditions(): Condition[] {
    return readArray<Condition>(LS_CONDITIONS);
  },
  saveCondition(condition: Condition) {
    const list = readArray<Condition>(LS_CONDITIONS);
    writeArray(LS_CONDITIONS, [...list, condition]);
  },

  // Job files
  listJobFiles(): JobFile[] {
    return readArray<JobFile>(LS_JOBFILES);
  },
  saveJobFile(job: JobFile) {
    const list = readArray<JobFile>(LS_JOBFILES);
    const existingIndex = list.findIndex((j) => j.id === job.id);
    if (existingIndex >= 0) {
      list[existingIndex] = job;
    } else {
      list.push(job);
    }
    writeArray(LS_JOBFILES, list);
  },
  deleteJobFile(jobId: string) {
    const list = readArray<JobFile>(LS_JOBFILES);
    writeArray(
      LS_JOBFILES,
      list.filter((j) => j.id !== jobId)
    );
  }
};

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// Storage utilities for job management
