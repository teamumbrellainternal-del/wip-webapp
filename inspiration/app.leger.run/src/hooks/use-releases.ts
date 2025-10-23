/**
 * Releases management hook
 * Handles CRUD operations for releases with loading states
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { ReleaseRecord, CreateReleaseInput, UpdateReleaseInput } from '@/types';

export function useReleases() {
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReleases = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.listReleases();
      setReleases(response.releases);
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to fetch releases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const createRelease = async (data: CreateReleaseInput): Promise<ReleaseRecord | null> => {
    setIsSaving(true);
    try {
      const release = await apiClient.createRelease(data);
      toast.success('Release created', {
        description: `${data.name} has been created successfully.`,
      });
      await fetchReleases(); // Refetch to get updated list
      return release;
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to create release:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateRelease = async (
    id: string,
    data: UpdateReleaseInput
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      await apiClient.updateRelease(id, data);
      toast.success('Release updated', {
        description: `Release has been updated successfully.`,
      });
      await fetchReleases(); // Refetch to get updated list
      return true;
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to update release:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRelease = async (id: string, name: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await apiClient.deleteRelease(id);
      toast.success('Release deleted', {
        description: `${name} has been removed.`,
      });
      await fetchReleases(); // Refetch to get updated list
      return true;
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to delete release:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    releases,
    isLoading,
    isSaving,
    isDeleting,
    createRelease,
    updateRelease,
    deleteRelease,
    refetch: fetchReleases,
  };
}
