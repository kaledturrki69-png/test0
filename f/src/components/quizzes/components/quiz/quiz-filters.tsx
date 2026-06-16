'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { IconSearch } from '@tabler/icons-react';
import { Skill } from '@/types/skill';
import { useTranslations } from 'next-intl';

interface QuizFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSkillId: number | 'all';
  onSkillChange: (value: number | 'all') => void;
  hardSkills: Skill[];
  softSkills: Skill[];
}

export function QuizFilters({
  searchTerm,
  onSearchChange,
  selectedSkillId,
  onSkillChange,
  hardSkills,
  softSkills
}: QuizFiltersProps) {
  const t = useTranslations('quiz_components');

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <div className='relative min-w-[250px] flex-1'>
        <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10'
        />
      </div>

      <Select
        value={selectedSkillId.toString()}
        onValueChange={(value) =>
          onSkillChange(value === 'all' ? 'all' : parseInt(value))
        }
      >
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder={t('all_skills')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>{t('all_skills')}</SelectItem>
          <Separator className='my-1' />
          <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold'>
            {t('hard_skills')}
          </div>
          {hardSkills.map((skill) => (
            <SelectItem key={skill.id} value={skill.id.toString()}>
              {skill.name}
            </SelectItem>
          ))}
          <Separator className='my-1' />
          <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold'>
            {t('soft_skills')}
          </div>
          {softSkills.map((skill) => (
            <SelectItem key={skill.id} value={skill.id.toString()}>
              {skill.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
