'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconH1,
  IconH2,
  IconH3
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface WysiwygEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function WysiwygEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false
}: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    }
  });

  // Keep editor content in sync when the prop changes after mount
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content != null && content !== current) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type='button'
      variant={isActive ? 'default' : 'outline'}
      size='sm'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className='h-8 w-8 p-0'
    >
      {children}
    </Button>
  );

  return (
    <div
      className={cn(
        'bg-background flex w-full flex-col gap-2 rounded-md border p-2',
        className
      )}
    >
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-1'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title='Bold'
        >
          <IconBold className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='Italic'
        >
          <IconItalic className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title='Underline'
        >
          <IconUnderline className='h-4 w-4' />
        </ToolbarButton>

        <div className='bg-border mx-1 h-6 w-px' />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title='Heading 1'
        >
          <IconH1 className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title='Heading 2'
        >
          <IconH2 className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title='Heading 3'
        >
          <IconH3 className='h-4 w-4' />
        </ToolbarButton>

        <div className='bg-border mx-1 h-6 w-px' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title='Bullet List'
        >
          <IconList className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title='Numbered List'
        >
          <IconListNumbers className='h-4 w-4' />
        </ToolbarButton>

        <div className='bg-border mx-1 h-6 w-px' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title='Quote'
        >
          <IconQuote className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title='Code Block'
        >
          <IconCode className='h-4 w-4' />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className='prose prose-sm max-w-none rounded-md border p-2'>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
