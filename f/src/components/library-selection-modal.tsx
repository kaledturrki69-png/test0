'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Library } from '@/types/position';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface LibrarySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (library: Library) => void;
  onContinueWithout: () => void;
}

export function LibrarySelectionModal({
  isOpen,
  onClose,
  onSelect,
  onContinueWithout
}: LibrarySelectionModalProps) {
  const { data: session } = useSession();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('library_selection');

  const fetchLibraries = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const response = await fetch('/api/libraries', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(t('load_error'));
      }

      const data = await response.json();
      setLibraries(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(t('load_error'));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, t]);

  useEffect(() => {
    if (isOpen && session?.accessToken) {
      fetchLibraries();
    }
  }, [isOpen, session?.accessToken, fetchLibraries]);

  const handleSelect = (library: Library) => {
    onSelect(library);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('select_library')}</DialogTitle>
          <DialogDescription>
            {t('select_library_description')}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='text-muted-foreground py-8 text-center'>
            {t('loading_libraries')}
          </div>
        ) : libraries.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            {t('no_libraries')}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {libraries.map((library) => (
              <Card
                key={library.id}
                className='cursor-pointer transition-shadow hover:shadow-md'
                onClick={() => handleSelect(library)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='text-base'>{library.name}</CardTitle>
                    <Badge variant='secondary'>{library.category.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground line-clamp-3 text-sm'>
                    {library.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onContinueWithout}>
            {t('continue_without')}
          </Button>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
