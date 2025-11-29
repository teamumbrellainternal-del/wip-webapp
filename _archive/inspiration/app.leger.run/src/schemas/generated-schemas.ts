/**
 * Placeholder schema exports for v0.2.0+
 * These will be replaced with actual generated schemas
 */

// Local JSONSchema7 type definition
/* eslint-disable @typescript-eslint/no-explicit-any */
type JSONSchema7 = {
  type?: string | string[];
  properties?: Record<string, any>;
  additionalProperties?: boolean | object;
  [key: string]: any;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const configSchema: JSONSchema7 = {
  type: 'object',
  properties: {},
  additionalProperties: true,
};

export const uiSchema = {
  'ui:order': [],
};

export const schemaMetadata = {
  version: '0.2.0-placeholder',
  fields: [],
  categoryCount: 0,
  fieldCount: 0,
  generatedAt: new Date().toISOString(),
};

export function getAllFieldNames(): string[] {
  return [];
}
