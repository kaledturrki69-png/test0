'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Product } from '@/constants/data';
import { IconDotsVertical, IconTrash, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { UploadModal } from '@/features/products/components/upload-modal';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading] = useState(false);
  const [open, setOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  // const router = useRouter();
  // const pathname = usePathname();

  // Extract current locale from pathname
  // const locale = pathname.split('/')[1] || 'en';

  const onConfirm = async () => {};

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              // Download functionality - you can implement the actual download logic here
            }}
          >
            <IconDownload className='mr-2 h-4 w-4' /> Download
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={() => setUpdateModalOpen(true)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadModal
        mode='update'
        currentFile={{
          name: data.name,
          size: `${data.price} mb`
        }}
        isOpen={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
      >
        <div />
      </UploadModal>
    </>
  );
};
