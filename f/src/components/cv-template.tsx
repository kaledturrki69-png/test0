'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Award,
  GraduationCap
} from 'lucide-react';
import { Candidate } from '@/data/candidates';

interface CVTemplateProps {
  candidate: Candidate;
}

export default function CVTemplate({ candidate }: CVTemplateProps) {
  return (
    <div className='w-full bg-white'>
      {/* Header Section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white'>
        <div className='flex items-center space-x-3'>
          <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/20'>
            {candidate.avatar ? (
              <Image
                src={candidate.avatar}
                alt={candidate.name}
                width={64}
                height={64}
                className='h-full w-full object-cover'
                unoptimized
              />
            ) : (
              <User className='h-8 w-8 text-white' />
            )}
          </div>
          <div className='flex-1'>
            <h1 className='mb-1 text-xl font-bold'>{candidate.name}</h1>
            <p className='mb-1 text-base text-blue-100'>{candidate.title}</p>
            <p className='max-w-2xl text-xs text-blue-100'>
              {candidate.description}
            </p>
          </div>
        </div>
      </div>

      <div className='p-4'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Left Column */}
          <div className='space-y-3 lg:col-span-1'>
            {/* Contact Information */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Contact</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 pt-0'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-4 w-4 text-blue-600' />
                  <span className='text-sm'>{candidate.email}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-blue-600' />
                  <span className='text-sm'>{candidate.phone}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <Linkedin className='h-4 w-4 text-blue-600' />
                  <a
                    href={candidate.linkedin}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:underline'
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Skills</CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='flex flex-wrap gap-2'>
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {skill || 'No skill'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Languages</CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-2'>
                  {candidate.languages.map((language, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <div className='h-2 w-2 rounded-full bg-blue-600'></div>
                      <span className='text-sm'>{language}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className='space-y-3 lg:col-span-2'>
            {/* Professional Experience */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center text-lg'>
                  <Award className='mr-2 h-4 w-4 text-blue-600' />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-0'>
                {candidate.experience.map((exp, index) => (
                  <div key={index} className='border-l-4 border-blue-600 pl-3'>
                    <div className='mb-1 flex items-start justify-between'>
                      <div>
                        <h3 className='text-base font-semibold'>{exp.title}</h3>
                        <p className='text-sm font-medium text-blue-600'>
                          {exp.company}
                        </p>
                      </div>
                      <div className='flex items-center text-xs text-gray-600'>
                        <Calendar className='mr-1 h-3 w-3' />
                        {exp.years}
                      </div>
                    </div>
                    <p className='text-xs text-gray-700'>{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center text-lg'>
                  <GraduationCap className='mr-2 h-4 w-4 text-blue-600' />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 pt-0'>
                {candidate.education.map((edu, index) => (
                  <div key={index} className='border-l-4 border-blue-600 pl-3'>
                    <div className='mb-1 flex items-start justify-between'>
                      <div>
                        <h3 className='text-base font-semibold'>
                          {edu.degree}
                        </h3>
                        <p className='text-sm font-medium text-blue-600'>
                          {edu.institution}
                        </p>
                      </div>
                      <div className='flex items-center text-xs text-gray-600'>
                        <Calendar className='mr-1 h-3 w-3' />
                        {edu.years}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Tags</CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='flex flex-wrap gap-2'>
                  {candidate.tags.map((tag, index) => (
                    <Badge key={index} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
