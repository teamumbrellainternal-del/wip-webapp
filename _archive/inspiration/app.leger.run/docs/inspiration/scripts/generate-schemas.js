#!/usr/bin/env node

/**
 * Generate RJSF schemas directly from OpenAPI spec
 * Creates TypeScript file, no intermediate JSON files needed
 * 
 * Input: /schemas/openwebui-config-schema.json (OpenAPI spec)
 * Output: /src/schemas/generated-schemas.ts (TypeScript module)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const OPENAPI_SPEC_PATH = path.join(__dirname, '../schemas/openwebui-config-schema.json');
const OUTPUT_DIR = path.join(__dirname, '../src/schemas');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generated-schemas.ts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create a minimal fallback schema if the OpenAPI spec doesn't exist
function createFallbackSchema() {
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "OpenWebUI Configuration",
    "description": "Configuration for OpenWebUI deployment",
    "type": "object",
    "properties": {
      "general": {
        "type": "object",
        "title": "General Settings",
        "properties": {
          "WEBUI_URL": {
            "type": "string",
            "title": "Application URL",
            "description": "The URL where OpenWebUI will be accessible"
          },
          "WEBUI_SECRET_KEY": {
            "type": "string",
            "title": "Secret Key",
            "description": "Secret key for session encryption"
          }
        }
      },
      "database": {
        "type": "object",
        "title": "Database Settings",
        "properties": {
          "DATABASE_URL": {
            "type": "string",
            "title": "Database URL",
            "description": "Database connection string"
          }
        }
      }
    }
  };
}

// Create a minimal UI schema
function createFallbackUiSchema() {
  return {
    "ui:title": "OpenWebUI Configuration",
    "ui:description": "Configure your OpenWebUI deployment",
    "general": {
      "ui:title": "General Settings",
      "ui:collapsible": true,
      "ui:collapsed": false,
      "WEBUI_URL": {
        "ui:widget": "URLWidget",
        "ui:placeholder": "https://example.com",
        "ui:help": "The URL where your OpenWebUI instance will be accessible"
      },
      "WEBUI_SECRET_KEY": {
        "ui:widget": "PasswordWidget",
        "ui:help": "A secure random string for encrypting sessions"
      }
    },
    "database": {
      "ui:title": "Database Settings",
      "ui:collapsible": true,
      "ui:collapsed": true,
      "DATABASE_URL": {
        "ui:widget": "TextWidget",
        "ui:placeholder": "postgresql://user:pass@localhost:5432/db",
        "ui:help": "Connection string for your database"
      }
    }
  };
}

// Read OpenAPI spec or use fallback
let openApiSpec;
let configSchema;
let uiSchema;

if (!fs.existsSync(OPENAPI_SPEC_PATH)) {
  console.warn('⚠️  OpenAPI spec not found at:', OPENAPI_SPEC_PATH);
  console.warn('   Using fallback schema. Please create /schemas/openwebui-config-schema.json');
  
  // Use fallback schemas
  configSchema = createFallbackSchema();
  uiSchema = createFallbackUiSchema();
} else {
  console.log('📖 Reading OpenAPI spec from:', OPENAPI_SPEC_PATH);
  
  try {
    openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_SPEC_PATH, 'utf8'));
    
    // Extract the main config schema
    const configDefinition = openApiSpec.components?.schemas?.OpenWebUIConfig || openApiSpec;
    
    /**
     * Convert OpenAPI schema to JSON Schema for RJSF
     */
    function convertToJsonSchema(openApiSchema) {
      const jsonSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "OpenWebUI Configuration",
        "description": "Configuration for OpenWebUI deployment",
        "type": "object",
        "properties": {}
      };
    
      // Group properties by category
      const categories = new Map();
      
      Object.entries(openApiSchema.properties || {}).forEach(([fieldName, fieldDef]) => {
        // Extract category from x-category or derive from field name
        let category = fieldDef['x-category'] || 'general';
        
        // Parse complex categories like "App/Backend - General"
        if (category.includes(' - ')) {
          category = category.split(' - ')[0];
        }
        category = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (!categories.has(category)) {
          categories.set(category, {
            type: "object",
            title: formatCategoryTitle(category),
            properties: {}
          });
        }
        
        // Convert field definition
        const convertedField = {
          type: fieldDef.type || 'string',
          title: fieldDef['x-title'] || fieldDef.title || formatFieldTitle(fieldName),
          description: fieldDef.description
        };
        
        // Copy over standard JSON Schema properties
        if (fieldDef.default !== undefined) convertedField.default = fieldDef.default;
        if (fieldDef.enum) convertedField.enum = fieldDef.enum;
        if (fieldDef.minimum !== undefined) convertedField.minimum = fieldDef.minimum;
        if (fieldDef.maximum !== undefined) convertedField.maximum = fieldDef.maximum;
        if (fieldDef.minLength !== undefined) convertedField.minLength = fieldDef.minLength;
        if (fieldDef.maxLength !== undefined) convertedField.maxLength = fieldDef.maxLength;
        if (fieldDef.pattern) convertedField.pattern = fieldDef.pattern;
        if (fieldDef.format) convertedField.format = fieldDef.format;
        
        categories.get(category).properties[fieldName] = convertedField;
      });
      
      // Build final schema with categories
      categories.forEach((categorySchema, categoryName) => {
        jsonSchema.properties[categoryName] = categorySchema;
      });
      
      // Add dependencies if specified
      if (openApiSchema['x-dependencies']) {
        jsonSchema.dependencies = openApiSchema['x-dependencies'];
      }
      
      return jsonSchema;
    }
    
    /**
     * Generate UI Schema from OpenAPI extensions
     */
    function generateUiSchema(openApiSchema) {
      const uiSchema = {
        "ui:title": "OpenWebUI Configuration",
        "ui:description": "Configure your OpenWebUI deployment"
      };
      
      // Track categories
      const categoryUiSchemas = new Map();
      
      Object.entries(openApiSchema.properties || {}).forEach(([fieldName, fieldDef]) => {
        // Get category
        let category = fieldDef['x-category'] || 'general';
        if (category.includes(' - ')) {
          category = category.split(' - ')[0];
        }
        category = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (!categoryUiSchemas.has(category)) {
          categoryUiSchemas.set(category, {
            "ui:title": formatCategoryTitle(category),
            "ui:collapsible": true,
            "ui:collapsed": category !== 'general' // Expand general by default
          });
        }
        
        // Build UI schema for field
        const fieldUi = {};
        
        // Determine widget based on type and extensions
        if (fieldDef['x-sensitive'] || fieldDef['x-secret']) {
          fieldUi['ui:widget'] = 'PasswordWidget';
        } else if (fieldDef.type === 'boolean') {
          fieldUi['ui:widget'] = 'CheckboxWidget';
        } else if (fieldDef.enum && fieldDef.enum.length > 0) {
          fieldUi['ui:widget'] = 'SelectWidget';
        } else if (fieldDef.format === 'uri' || fieldDef.format === 'url') {
          fieldUi['ui:widget'] = 'URLWidget';
        } else if (fieldDef['x-multiline'] || fieldDef.format === 'textarea') {
          fieldUi['ui:widget'] = 'TextareaWidget';
        } else {
          fieldUi['ui:widget'] = 'TextWidget';
        }
        
        // Add help text
        if (fieldDef['x-help'] || fieldDef.description) {
          fieldUi['ui:help'] = fieldDef['x-help'] || fieldDef.description;
        }
        
        // Add placeholder
        if (fieldDef['x-placeholder'] || fieldDef.example) {
          fieldUi['ui:placeholder'] = fieldDef['x-placeholder'] || fieldDef.example;
        }
        
        // Handle visibility
        if (fieldDef['x-visibility'] === 'hidden') {
          fieldUi['ui:widget'] = 'hidden';
        }
        
        // Handle display order
        if (fieldDef['x-display-order']) {
          fieldUi['ui:order'] = fieldDef['x-display-order'];
        }
        
        categoryUiSchemas.get(category)[fieldName] = fieldUi;
      });
      
      // Add category UI schemas to main schema
      categoryUiSchemas.forEach((categoryUi, categoryName) => {
        uiSchema[categoryName] = categoryUi;
      });
      
      return uiSchema;
    }
    
    /**
     * Format helpers
     */
    function formatCategoryTitle(category) {
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    function formatFieldTitle(fieldName) {
      return fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Generate schemas
    console.log('🔄 Converting OpenAPI to RJSF schemas...');
    configSchema = convertToJsonSchema(configDefinition);
    uiSchema = generateUiSchema(configDefinition);
  } catch (error) {
    console.error('❌ Error processing OpenAPI spec:', error.message);
    console.warn('   Using fallback schema');
    
    // Use fallback schemas
    configSchema = createFallbackSchema();
    uiSchema = createFallbackUiSchema();
  }
}

// Count statistics
const categoryCount = Object.keys(configSchema.properties).length;
const fieldCount = Object.values(configSchema.properties).reduce(
  (sum, cat) => sum + Object.keys(cat.properties).length, 0
);

console.log(`📊 Generated ${categoryCount} categories with ${fieldCount} total fields`);

// Generate TypeScript module
const tsContent = `/**
 * Auto-generated RJSF schemas from OpenAPI specification
 * Generated at: ${new Date().toISOString()}
 * Source: /schemas/openwebui-config-schema.json
 * 
 * DO NOT EDIT THIS FILE DIRECTLY
 * To modify schemas, edit the OpenAPI spec and regenerate
 */

import type { RJSFSchema, UiSchema } from '@rjsf/utils';

/**
 * JSON Schema for RJSF form structure
 * Defines field types, validation, and hierarchy
 */
export const configSchema: RJSFSchema = ${JSON.stringify(configSchema, null, 2)};

/**
 * UI Schema for RJSF form presentation
 * Defines widgets, help text, and display options
 */
export const uiSchema: UiSchema = ${JSON.stringify(uiSchema, null, 2)};

/**
 * Metadata about the generated schemas
 */
export const schemaMetadata = {
  generatedAt: '${new Date().toISOString()}',
  source: 'OpenAPI specification',
  version: '${openApiSpec?.info?.version || '1.0.0'}',
  categoryCount: ${categoryCount},
  fieldCount: ${fieldCount}
};

/**
 * Helper to get all field names
 */
export function getAllFieldNames(): string[] {
  const fields: string[] = [];
  Object.values(configSchema.properties).forEach((category: any) => {
    if (category.properties) {
      fields.push(...Object.keys(category.properties));
    }
  });
  return fields;
}

/**
 * Helper to get schema for a specific field
 */
export function getFieldSchema(fieldName: string): any {
  for (const category of Object.values(configSchema.properties)) {
    if ((category as any).properties?.[fieldName]) {
      return (category as any).properties[fieldName];
    }
  }
  return null;
}
`;

// Write the TypeScript file
fs.writeFileSync(OUTPUT_FILE, tsContent);
console.log('✅ Generated TypeScript schemas at:', OUTPUT_FILE);

// Clean up old JSON files if they exist (optional)
const oldJsonFiles = [
  path.join(OUTPUT_DIR, 'config-schema.json'),
  path.join(OUTPUT_DIR, 'ui-schema.json')
];

oldJsonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`🧹 Removing old JSON file: ${file}`);
    fs.unlinkSync(file);
  }
});

console.log('\n✨ Schema generation complete!');
console.log('   The form will now use the generated TypeScript schemas');
console.log('   No intermediate JSON files needed');
