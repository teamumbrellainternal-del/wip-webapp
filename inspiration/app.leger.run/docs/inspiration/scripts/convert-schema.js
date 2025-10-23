#!/usr/bin/env node

/**
 * OpenAPI to JSON Schema Conversion Script
 * 
 * Converts OpenAPI schema with x-extensions to native JSON Schema + uiSchema
 * Part of Task 016: Schema Conversion to Native JSON Schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert OpenAPI schema to native JSON Schema
 */
function convertToJsonSchema(openApiSchema) {
  // Extract the main config schema
  const configSchema = openApiSchema.components.schemas.OpenWebUIConfig;
  
  // Create base JSON Schema structure
  const jsonSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://schemas.openwebui.com/config/v1",
    "title": "OpenWebUI Configuration Schema",
    "description": "Complete configuration schema for OpenWebUI deployment",
    "type": "object",
    "properties": {},
    "dependencies": {},
    "allOf": []
  };
  
  // Track categories for hierarchical organization
  const categoryMap = new Map();
  
  // Process each property
  Object.entries(configSchema.properties).forEach(([fieldName, fieldDef]) => {
    // Extract category information
    const category = fieldDef['x-category'] || 'general';
    
    // Clean up the field definition - remove x-extensions
    const cleanedField = { ...fieldDef };
    
    // Convert x-extensions to native JSON Schema
    if (fieldDef['x-sensitive']) {
      cleanedField.format = 'password';
    }
    
    if (fieldDef['x-visibility'] === 'hidden') {
      // Skip hidden fields entirely for JSON Schema
      return;
    }
    
    // Remove all x-extensions from JSON Schema
    Object.keys(cleanedField).forEach(key => {
      if (key.startsWith('x-')) {
        delete cleanedField[key];
      }
    });
    
    // Add to appropriate category
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        title: category,
        properties: {},
        fields: []
      });
    }
    
    categoryMap.get(category).properties[fieldName] = cleanedField;
    categoryMap.get(category).fields.push(fieldName);
  });
  
  // Build hierarchical structure
  const hierarchicalProps = {};
  categoryMap.forEach((categoryData, categoryName) => {
    // Parse category hierarchy (e.g., "App/Backend - General" -> nested structure)
    const parts = categoryName.split(/[\s\-\/]+/).filter(Boolean);
    const mainCategory = parts[0].toLowerCase();
    const subCategory = parts.slice(1).join('_').toLowerCase() || 'general';
    
    if (!hierarchicalProps[mainCategory]) {
      hierarchicalProps[mainCategory] = {
        type: "object",
        title: toTitleCase(mainCategory),
        properties: {}
      };
    }
    
    hierarchicalProps[mainCategory].properties[subCategory] = {
      type: "object",
      title: toTitleCase(subCategory),
      properties: categoryData.properties
    };
  });
  
  jsonSchema.properties = hierarchicalProps;
  
  // Process dependencies
  const dependencies = {};
  Object.entries(configSchema.properties).forEach(([fieldName, fieldDef]) => {
    if (fieldDef['x-depends-on']) {
      const dependsOn = fieldDef['x-depends-on'];
      Object.entries(dependsOn).forEach(([depField, depValue]) => {
        if (!dependencies[depField]) {
          dependencies[depField] = [];
        }
        
        dependencies[depField].push({
          if: { properties: { [depField]: { const: depValue } } },
          then: { required: [fieldName] }
        });
      });
    }
    
    if (fieldDef['x-provider-fields'] && Array.isArray(fieldDef['x-provider-fields'])) {
      // Convert provider fields to conditional schemas
      if (fieldDef.enum) {
        fieldDef.enum.forEach(enumValue => {
          const conditionalSchema = {
            if: { properties: { [fieldName]: { const: enumValue } } },
            then: {
              properties: {},
              required: []
            }
          };
          
          // Add provider-specific fields (this would need the full field definitions)
          jsonSchema.allOf.push(conditionalSchema);
        });
      }
    }
  });
  
  // Convert dependencies to JSON Schema format
  Object.entries(dependencies).forEach(([field, conditions]) => {
    if (conditions.length === 1) {
      jsonSchema.dependencies[field] = conditions[0];
    } else {
      jsonSchema.dependencies[field] = { anyOf: conditions };
    }
  });
  
  return jsonSchema;
}

/**
 * Extract uiSchema from x-extensions
 */
function extractUiSchema(openApiSchema) {
  const configSchema = openApiSchema.components.schemas.OpenWebUIConfig;
  
  const uiSchema = {
    "$schema": "https://schemas.openwebui.com/ui-schema/v1",
    "ui:title": "OpenWebUI Configuration",
    "ui:description": "Configure your OpenWebUI deployment",
    "ui:ObjectFieldTemplate": "CategoryObjectTemplate",
    "ui:FieldTemplate": "AdvancedFieldTemplate"
  };
  
  // Track categories and ordering
  const categories = new Map();
  const fieldOrdering = [];
  
  Object.entries(configSchema.properties).forEach(([fieldName, fieldDef]) => {
    const category = fieldDef['x-category'] || 'general';
    const order = fieldDef['x-display-order'] || 999;
    
    fieldOrdering.push({ field: fieldName, category, order });
    
    // Extract UI properties
    const fieldUi = {};
    
    if (fieldDef['x-sensitive']) {
      fieldUi['ui:widget'] = 'PasswordWidget';
    } else if (fieldDef.type === 'boolean') {
      fieldUi['ui:widget'] = 'CheckboxWidget';
    } else if (fieldDef.enum) {
      fieldUi['ui:widget'] = 'SelectWidget';
      if (fieldDef.enum.length > 0) {
        fieldUi['ui:enumOptions'] = fieldDef.enum.map(value => ({
          value,
          label: toTitleCase(value.toString())
        }));
      }
    } else if (fieldDef.format === 'uri') {
      fieldUi['ui:widget'] = 'URLWidget';
    } else {
      fieldUi['ui:widget'] = 'TextWidget';
    }
    
    if (fieldDef['x-visibility'] === 'hidden') {
      fieldUi['ui:widget'] = 'hidden';
    }
    
    if (fieldDef.description) {
      fieldUi['ui:help'] = fieldDef.description;
    }
    
    // Add to category structure
    if (!categories.has(category)) {
      categories.set(category, {
        title: category,
        fields: new Map()
      });
    }
    
    categories.get(category).fields.set(fieldName, fieldUi);
  });
  
  // Build hierarchical uiSchema
  categories.forEach((categoryData, categoryName) => {
    const parts = categoryName.split(/[\s\-\/]+/).filter(Boolean);
    const mainCategory = parts[0].toLowerCase();
    const subCategory = parts.slice(1).join('_').toLowerCase() || 'general';
    
    if (!uiSchema[mainCategory]) {
      uiSchema[mainCategory] = {
        "ui:title": `${toTitleCase(mainCategory)} Settings`,
        "ui:collapsible": true
      };
    }
    
    if (!uiSchema[mainCategory][subCategory]) {
      uiSchema[mainCategory][subCategory] = {
        "ui:title": toTitleCase(subCategory),
        "ui:collapsible": true
      };
    }
    
    categoryData.fields.forEach((fieldUi, fieldName) => {
      uiSchema[mainCategory][subCategory][fieldName] = fieldUi;
    });
  });
  
  // Add ordering
  const sortedFields = fieldOrdering
    .sort((a, b) => a.order - b.order)
    .map(item => item.field);
    
  uiSchema['ui:order'] = sortedFields.slice(0, 20); // Limit for readability
  
  return uiSchema;
}

/**
 * Utility function to convert strings to title case
 */
function toTitleCase(str) {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Main conversion function
 */
function main() {
  try {
    console.log('🔄 Converting OpenAPI schema to JSON Schema + uiSchema...');
    
    // Read the OpenAPI schema
    const schemaPath = path.join(__dirname, '../schemas/openwebui-config-schema.json');
    const openApiSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    console.log(`📊 Processing ${Object.keys(openApiSchema.components.schemas.OpenWebUIConfig.properties).length} fields...`);
    
    // Convert schemas
    const jsonSchema = convertToJsonSchema(openApiSchema);
    const uiSchema = extractUiSchema(openApiSchema);
    
    // Ensure output directory exists
    const outputDir = path.join(__dirname, '../schemas');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write output files
    const jsonSchemaPath = path.join(outputDir, 'config-schema.json');
    const uiSchemaPath = path.join(outputDir, 'ui-schema.json');
    
    fs.writeFileSync(jsonSchemaPath, JSON.stringify(jsonSchema, null, 2));
    fs.writeFileSync(uiSchemaPath, JSON.stringify(uiSchema, null, 2));
    
    console.log('✅ Conversion completed!');
    console.log(`📁 JSON Schema: ${jsonSchemaPath}`);
    console.log(`📁 UI Schema: ${uiSchemaPath}`);
    console.log(`📊 Categories processed: ${Object.keys(jsonSchema.properties).length}`);
    console.log(`📊 Dependencies converted: ${Object.keys(jsonSchema.dependencies).length}`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run the conversion
main();