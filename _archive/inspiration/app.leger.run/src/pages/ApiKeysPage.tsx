/**
 * API Keys Page
 * Secret management with provider categories
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategorySection } from '@/components/ui/form/layouts/category-section';
import { SecretField } from '@/components/ui/form/fields/secret-field';
import { useSecrets } from '@/hooks/use-secrets';

// Provider configuration
const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Configure your OpenAI API keys for GPT models',
    secrets: ['OPENAI_API_KEY'],
    docsUrl: 'https://platform.openai.com/docs/api-reference/authentication',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Configure your Anthropic API keys for Claude models',
    secrets: ['ANTHROPIC_API_KEY'],
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Configure your Google AI API keys for Gemini models',
    secrets: ['GOOGLE_API_KEY'],
    docsUrl: 'https://ai.google.dev/docs',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Configure your Cohere API keys',
    secrets: ['COHERE_API_KEY'],
    docsUrl: 'https://docs.cohere.com/docs/authentication',
  },
];

export function ApiKeysPage() {
  const { secrets, isLoading, upsertSecret } = useSecrets();

  // State for each provider section
  const [providerStates, setProviderStates] = useState<
    Record<
      string,
      {
        values: Record<string, string>;
        isDirty: boolean;
        isSaving: boolean;
      }
    >
  >({});

  // Initialize state from secrets
  useEffect(() => {
    if (secrets.length > 0) {
      const initialState: typeof providerStates = {};

      PROVIDERS.forEach((provider) => {
        const values: Record<string, string> = {};
        provider.secrets.forEach((secretName) => {
          const secret = secrets.find((s) => s.name === secretName);
          values[secretName] = secret?.value || '';
        });

        initialState[provider.id] = {
          values,
          isDirty: false,
          isSaving: false,
        };
      });

      setProviderStates(initialState);
    }
  }, [secrets]);

  const handleFieldChange = (providerId: string, secretName: string, value: string) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        values: {
          ...prev[providerId]?.values,
          [secretName]: value,
        },
        isDirty: true,
      },
    }));
  };

  const handleSave = async (providerId: string) => {
    const state = providerStates[providerId];
    if (!state) return;

    setProviderStates((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        isSaving: true,
      },
    }));

    // Save all secrets for this provider
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;

    let allSuccessful = true;
    for (const secretName of provider.secrets) {
      const value = state.values[secretName];
      if (value) {
        const success = await upsertSecret(secretName, value);
        if (!success) {
          allSuccessful = false;
        }
      }
    }

    setProviderStates((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        isDirty: !allSuccessful,
        isSaving: false,
      },
    }));
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="API Keys"
        description="Manage your API keys for different AI providers. These secrets are encrypted and stored securely."
      />

      {PROVIDERS.map((provider) => {
        const state = providerStates[provider.id];

        return (
          <CategorySection
            key={provider.id}
            title={provider.name}
            description={provider.description}
            isDirty={state?.isDirty || false}
            isLoading={state?.isSaving || false}
            onSave={() => handleSave(provider.id)}
            documentationLink={{
              text: 'View documentation',
              href: provider.docsUrl,
            }}
          >
            {provider.secrets.map((secretName) => (
              <SecretField
                key={secretName}
                label={secretName}
                value={state?.values[secretName] || ''}
                onChange={(e) =>
                  handleFieldChange(provider.id, secretName, e.target.value)
                }
                placeholder={`Enter your ${provider.name} API key`}
              />
            ))}
          </CategorySection>
        );
      })}
    </PageLayout>
  );
}
