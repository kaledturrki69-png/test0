'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';
import { Skill } from '@/types/skill';
import { X } from 'lucide-react';

interface SkillSelectorProps {
  title: string;
  type: 'soft' | 'hard';
  availableSkills: Skill[];
  selectedSkillIds: number[];
  skillWeights: Record<number, number>;
  onAdd: (skillId: number) => void;
  onRemove: (skillId: number) => void;
  onWeightChange: (skillId: number, weight: number) => void;
  isViewMode?: boolean;
  loading?: boolean;
  selectPlaceholder?: string;
}

export function SkillSelector({
  title,
  type,
  availableSkills,
  selectedSkillIds,
  skillWeights,
  onAdd,
  onRemove,
  onWeightChange,
  isViewMode = false,
  loading = false,
  selectPlaceholder = 'Select skill'
}: SkillSelectorProps) {
  const selectedSkills = availableSkills.filter((s) =>
    selectedSkillIds.includes(s.id)
  );
  const unselectedSkills = availableSkills.filter(
    (s) => !selectedSkillIds.includes(s.id)
  );

  const handleAddSkill = (skillIdStr: string) => {
    const skillId = parseInt(skillIdStr);
    onAdd(skillId);
  };

  return (
    <>
      <Separator />
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='font-medium'>{title}</div>
          {!isViewMode && (
            <Select
              onValueChange={handleAddSkill}
              disabled={loading || unselectedSkills.length === 0}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder={selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {unselectedSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id.toString()}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className='space-y-2'>
          {selectedSkills.length === 0 ? (
            <div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
              No {type} skills selected yet
            </div>
          ) : (
            selectedSkills.map((skill) => (
              <div
                key={skill.id}
                className='flex items-center justify-between gap-3 rounded-md border p-2'
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{skill.name}</div>
                  <div className='text-muted-foreground text-xs'>
                    {skill.description}
                  </div>
                </div>
                <StarRating
                  value={skillWeights[skill.id] ?? 0}
                  readOnly={isViewMode}
                  onChange={
                    isViewMode
                      ? undefined
                      : (weight) => onWeightChange(skill.id, weight)
                  }
                />
                {!isViewMode && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onRemove(skill.id)}
                    disabled={loading}
                    className='h-8 w-8 p-0'
                  >
                    <X className='text-muted-foreground h-4 w-4' />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
