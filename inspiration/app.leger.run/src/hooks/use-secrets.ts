/**
 * Secrets management hook
 * Handles CRUD operations for secrets with loading states
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { SecretWithValue } from '@/types';

export function useSecrets() {
  const [secrets, setSecrets] = useState<SecretWithValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSecrets = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.listSecrets(true);
      setSecrets(response.secrets);
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to fetch secrets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const upsertSecret = async (name: string, value: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      await apiClient.upsertSecret(name, value);
      toast.success('Secret saved', {
        description: `${name} has been updated successfully.`,
      });
      await fetchSecrets(); // Refetch to get updated data
      return true;
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to save secret:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSecret = async (name: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await apiClient.deleteSecret(name);
      toast.success('Secret deleted', {
        description: `${name} has been removed.`,
      });
      await fetchSecrets(); // Refetch to get updated list
      return true;
    } catch (error) {
      // Error already toasted by API client
      console.error('Failed to delete secret:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    secrets,
    isLoading,
    isSaving,
    isDeleting,
    upsertSecret,
    deleteSecret,
    refetch: fetchSecrets,
  };
}
