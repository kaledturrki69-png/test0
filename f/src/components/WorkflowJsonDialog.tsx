'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import JSONView from '@uiw/react-json-view';
//import { githubLight, githubDark } from '@uiw/react-json-view/github';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface WorkflowJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
  title?: string;
}

/**
 * Displays a collapsible JSON viewer dialog for exported workflows or configs.
 * Supports copy and download actions.
 */
export function WorkflowJsonDialog({
  open,
  onOpenChange,
  data,
  title = 'Exported Workflow JSON'
}: WorkflowJsonDialogProps) {
  const { resolvedTheme } = useTheme();

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('JSON copied to clipboard');
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {data ? (
          <div className='bg-muted rounded-md border p-2'>
            <JSONView
              value={data}
              displayDataTypes={false}
              enableClipboard={false}
              //style={{ fontFamily: 'monospace', fontSize: 13 }}
              style={resolvedTheme === 'dark' ? darkTheme : lightTheme}
            />
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>No data available</p>
        )}

        <DialogFooter className='mt-2 flex justify-end gap-2'>
          <Button variant='secondary' onClick={handleCopy}>
            Copy JSON
          </Button>
          <Button variant='default' onClick={handleDownload}>
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
