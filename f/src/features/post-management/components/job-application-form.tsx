'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  softSkills: z
    .array(z.string())
    .min(1, 'Please select at least one soft skill'),
  hardSkills: z
    .array(z.string())
    .min(1, 'Please select at least one hard skill'),
  conditions: z
    .array(z.string())
    .min(1, 'Please select at least one condition'),
  otherEvolution: z.string().optional()
});

const softSkillsOptions = [
  'Communication',
  'Teamwork',
  'Adaptability',
  'Leadership',
  'Creativity',
  'Problem Solving',
  'Time Management',
  'Critical Thinking',
  'Emotional Intelligence',
  'Negotiation'
];

const hardSkillsOptions = [
  'React',
  'Next.js',
  'Node.js',
  'SQL',
  'Design',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'HTML/CSS',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Git',
  'Figma',
  'Adobe Creative Suite'
];

const conditionsOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'far-away', label: 'Far Away' },
  { value: 'remote', label: 'Remote' },
  { value: 'available-immediately', label: 'Available Immediately' },
  { value: 'internship', label: 'Internship' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' }
];

type FormValues = z.infer<typeof formSchema>;

export default function JobApplicationForm() {
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>([]);
  const [selectedHardSkills, setSelectedHardSkills] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      softSkills: [],
      hardSkills: [],
      conditions: [],
      otherEvolution: ''
    }
  });

  const toggleSoftSkill = (skill: string) => {
    const newSkills = selectedSoftSkills.includes(skill)
      ? selectedSoftSkills.filter((s) => s !== skill)
      : [...selectedSoftSkills, skill];
    setSelectedSoftSkills(newSkills);
    form.setValue('softSkills', newSkills);
  };

  const toggleHardSkill = (skill: string) => {
    const newSkills = selectedHardSkills.includes(skill)
      ? selectedHardSkills.filter((s) => s !== skill)
      : [...selectedHardSkills, skill];
    setSelectedHardSkills(newSkills);
    form.setValue('hardSkills', newSkills);
  };

  const toggleCondition = (condition: string) => {
    const newConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter((c) => c !== condition)
      : [...selectedConditions, condition];
    setSelectedConditions(newConditions);
    form.setValue('conditions', newConditions);
  };

  const onSubmit = () => {
    toast.success('Application submitted successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            Job Application Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            form={form as any}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'
          >
            {/* Soft Skills */}
            <FormField
              control={form.control}
              name='softSkills'
              render={() => (
                <FormItem>
                  <FormLabel className='text-base font-medium'>
                    Soft Skills
                  </FormLabel>
                  <FormControl>
                    <div className='flex flex-wrap gap-2'>
                      {softSkillsOptions.map((skill) => (
                        <Badge
                          key={skill}
                          variant={
                            selectedSoftSkills.includes(skill)
                              ? 'default'
                              : 'outline'
                          }
                          className='hover:bg-primary/10 cursor-pointer'
                          onClick={() => toggleSoftSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hard Skills */}
            <FormField
              control={form.control}
              name='hardSkills'
              render={() => (
                <FormItem>
                  <FormLabel className='text-base font-medium'>
                    Hard Skills
                  </FormLabel>
                  <FormControl>
                    <div className='flex flex-wrap gap-2'>
                      {hardSkillsOptions.map((skill) => (
                        <Badge
                          key={skill}
                          variant={
                            selectedHardSkills.includes(skill)
                              ? 'default'
                              : 'outline'
                          }
                          className='hover:bg-primary/10 cursor-pointer'
                          onClick={() => toggleHardSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditions */}
            <FormField
              control={form.control}
              name='conditions'
              render={() => (
                <FormItem>
                  <FormLabel className='text-base font-medium'>
                    Conditions
                  </FormLabel>
                  <FormControl>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {conditionsOptions.map((condition) => (
                        <div
                          key={condition.value}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={condition.value}
                            checked={selectedConditions.includes(
                              condition.value
                            )}
                            onCheckedChange={() =>
                              toggleCondition(condition.value)
                            }
                          />
                          <label
                            htmlFor={condition.value}
                            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                          >
                            {condition.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other / Evolution */}
            <FormField
              control={form.control}
              name='otherEvolution'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base font-medium'>
                    Other / Evolution
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add extra information or details about your career path or special conditions...'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full'>
              Submit Application
            </Button>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
