'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconBuilding, IconEdit } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';

export default function CompanyPage() {
  usePageTitle('Company');
  const { data: session, status } = useSession();
  const [workplaceDialogOpen, setWorkplaceDialogOpen] = useState(false);
  const [workplaces, setWorkplaces] = useState<any[]>([]);
  const [editingWorkplaceId, setEditingWorkplaceId] = useState<number | null>(
    null
  );
  const [creatingWorkplace, setCreatingWorkplace] = useState(false);
  const [workplaceForm, setWorkplaceForm] = useState({
    name: '',
    type: 'hq',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: '',
    latitude: '',
    longitude: '',
    is_main: false
  });

  // Decode JWT token to get company data
  const tokenData = useMemo(() => {
    try {
      const token: string | undefined = (session as any)?.accessToken;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      // Base64URL decode
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json);
      return payload;
    } catch {
      return null;
    }
  }, [session]);

  const handleWorkplaceFieldChange = (
    field: keyof typeof workplaceForm,
    value: string | boolean
  ) => {
    setWorkplaceForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchWorkplaces = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch('/api/accounts/workplaces', {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load workplaces');
      }

      const data = await response.json();
      setWorkplaces(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load workplaces'
      );
    }
  }, [session]);

  const resetWorkplaceForm = useCallback(() => {
    setWorkplaceForm({
      name: '',
      type: 'hq',
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      country: '',
      latitude: '',
      longitude: '',
      is_main: false
    });
    setEditingWorkplaceId(null);
  }, []);

  const openWorkplaceDialog = () => {
    resetWorkplaceForm();
    setWorkplaceDialogOpen(true);
  };

  const handleCreateWorkplace = async () => {
    if (!session?.accessToken) {
      toast.error('You must be signed in to add a workplace.');
      return;
    }

    if (!workplaceForm.name) {
      toast.error('Please provide a workplace name.');
      return;
    }

    try {
      setCreatingWorkplace(true);

      const response = await fetch('/api/accounts/workplaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(workplaceForm)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to create workplace');
      }

      toast.success('Workplace created successfully.');
      setWorkplaceDialogOpen(false);
      resetWorkplaceForm();
      await fetchWorkplaces();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create workplace'
      );
    } finally {
      setCreatingWorkplace(false);
    }
  };

  const handleUpdateWorkplace = async () => {
    if (!session?.accessToken || editingWorkplaceId === null) return;

    try {
      setCreatingWorkplace(true);

      const response = await fetch(
        `/api/accounts/workplaces/${editingWorkplaceId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(session as any)?.accessToken}`
          },
          body: JSON.stringify(workplaceForm)
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to update workplace');
      }

      toast.success('Workplace updated successfully.');
      setWorkplaceDialogOpen(false);
      resetWorkplaceForm();
      await fetchWorkplaces();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update workplace'
      );
    } finally {
      setCreatingWorkplace(false);
    }
  };

  const handleEditWorkplace = (workplace: any) => {
    setWorkplaceForm({
      name: workplace.name || '',
      type: workplace.type || 'hq',
      address_line1: workplace.address_line1 || '',
      address_line2: workplace.address_line2 || '',
      city: workplace.city || '',
      postal_code: workplace.postal_code || '',
      country: workplace.country || '',
      latitude: workplace.latitude || '',
      longitude: workplace.longitude || '',
      is_main: workplace.is_main ?? false
    });
    setEditingWorkplaceId(workplace.id);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setWorkplaceDialogOpen(open);
    if (!open) {
      resetWorkplaceForm();
    }
  };

  useEffect(() => {
    fetchWorkplaces();
  }, [fetchWorkplaces]);

  useEffect(() => {
    if (workplaceDialogOpen) {
      fetchWorkplaces();
    }
  }, [workplaceDialogOpen, fetchWorkplaces]);

  if (status === 'loading') {
    return (
      <PageContainer scrollable={true}>
        <div className='flex h-[calc(100vh-200px)] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Loading company information...</span>
        </div>
      </PageContainer>
    );
  }

  // Extract company data from decoded token
  const companyData = {
    id: tokenData?.company?.id || 'N/A',
    name: tokenData?.company?.name || 'Company Name',
    email: tokenData?.email || 'N/A',
    userFirstName: tokenData?.first_name || '',
    userLastName: tokenData?.last_name || '',
    userId: tokenData?.user_id || 'N/A'
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <h2 className='text-3xl font-bold tracking-tight'>Company</h2>
          </div>
          <p className='text-muted-foreground'>
            View and manage your company information
          </p>
        </div>
        <Separator />

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Company Overview Card */}
          <Card className='col-span-full'>
            <CardHeader>
              <div className='flex items-start gap-4'>
                <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-lg'>
                  <IconBuilding className='text-primary h-8 w-8' />
                </div>
                <div className='flex-1 space-y-3'>
                  <CardTitle className='text-2xl'>{companyData.name}</CardTitle>
                  <div className='flex items-start gap-4'>
                    <Button className='w-fit' onClick={openWorkplaceDialog}>
                      + Workplace
                    </Button>
                    {workplaces.length > 0 && (
                      <div className='flex-1 space-y-2'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Workplaces ({workplaces.length})
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {workplaces.map((workplace) => (
                            <div
                              key={workplace.id}
                              className='bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm'
                            >
                              <span className='font-medium'>
                                {workplace.name}
                              </span>
                              {workplace.address_line1 && (
                                <span className='text-muted-foreground'>
                                  ({workplace.address_line1})
                                </span>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-auto p-0'
                                onClick={() => {
                                  handleEditWorkplace(workplace);
                                  setWorkplaceDialogOpen(true);
                                }}
                              >
                                <IconEdit className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/*   <div className='grid gap-4 md:grid-cols-2'>
                <div className='flex items-start gap-3'>
                  <IconUser className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>User ID</p>
                    <p className='text-muted-foreground text-sm'>
                      {companyData.userId}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <IconMail className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>Email</p>
                    <p className='text-muted-foreground text-sm'>
                      {companyData.email}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <IconUsers className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>User Name</p>
                    <p className='text-muted-foreground text-sm'>
                      {companyData.userFirstName || companyData.userLastName
                        ? `${companyData.userFirstName} ${companyData.userLastName}`.trim()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <IconBuilding className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>Company Name</p>
                    <p className='text-muted-foreground text-sm'>
                      {companyData.name}
                    </p>
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={workplaceDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workplace</DialogTitle>
            <DialogDescription>
              Define a new workplace linked to your company.
            </DialogDescription>
          </DialogHeader>
          {workplaces.length > 0 && (
            <div className='mb-4 rounded-md border p-3'>
              <p className='text-foreground mb-2 text-sm font-medium'>
                Existing workplaces
              </p>
              <div className='max-h-40 space-y-2 overflow-auto pr-1'>
                {workplaces.map((workplace) => (
                  <div
                    key={workplace.id}
                    className='flex items-center justify-between rounded-md border p-2 text-sm'
                  >
                    <div className='flex flex-col'>
                      <span className='text-foreground font-medium'>
                        {workplace.name}
                      </span>
                      <span className='text-muted-foreground text-xs capitalize'>
                        {workplace.type === 'hq'
                          ? 'Headquarters'
                          : workplace.type === 'sub'
                            ? 'Subsidiary / Branch'
                            : 'Remote Office'}
                      </span>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='gap-1'
                      onClick={() => handleEditWorkplace(workplace)}
                    >
                      <IconEdit className='h-4 w-4' /> Edit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='workplace-name'>Name *</Label>
              <Input
                id='workplace-name'
                value={workplaceForm.name}
                onChange={(event) =>
                  handleWorkplaceFieldChange('name', event.target.value)
                }
                placeholder='e.g., Paris HQ'
              />
            </div>

            <div className='space-y-2'>
              <Label>Type</Label>
              <Select
                value={workplaceForm.type}
                onValueChange={(value) =>
                  handleWorkplaceFieldChange('type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='hq'>Headquarters</SelectItem>
                  <SelectItem value='sub'>Subsidiary / Branch</SelectItem>
                  <SelectItem value='remote'>Remote Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='address-line1'>Address line 1</Label>
                <Input
                  id='address-line1'
                  value={workplaceForm.address_line1}
                  onChange={(event) =>
                    handleWorkplaceFieldChange(
                      'address_line1',
                      event.target.value
                    )
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address-line2'>Address line 2</Label>
                <Input
                  id='address-line2'
                  value={workplaceForm.address_line2}
                  onChange={(event) =>
                    handleWorkplaceFieldChange(
                      'address_line2',
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  value={workplaceForm.city}
                  onChange={(event) =>
                    handleWorkplaceFieldChange('city', event.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='postal-code'>Postal code</Label>
                <Input
                  id='postal-code'
                  value={workplaceForm.postal_code}
                  onChange={(event) =>
                    handleWorkplaceFieldChange(
                      'postal_code',
                      event.target.value
                    )
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='country'>Country</Label>
                <Input
                  id='country'
                  value={workplaceForm.country}
                  onChange={(event) =>
                    handleWorkplaceFieldChange('country', event.target.value)
                  }
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='latitude'>Latitude</Label>
                <Input
                  id='latitude'
                  value={workplaceForm.latitude}
                  onChange={(event) =>
                    handleWorkplaceFieldChange('latitude', event.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='longitude'>Longitude</Label>
                <Input
                  id='longitude'
                  value={workplaceForm.longitude}
                  onChange={(event) =>
                    handleWorkplaceFieldChange('longitude', event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingWorkplaceId === null
                  ? handleCreateWorkplace
                  : handleUpdateWorkplace
              }
              disabled={creatingWorkplace}
            >
              {creatingWorkplace ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                </>
              ) : editingWorkplaceId === null ? (
                'Add Workplace'
              ) : (
                'Update Workplace'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
