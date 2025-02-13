import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" with { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true });

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    await generateType(typeName, typeSchema);
  }
}

async function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);
  const imports = new Set();

  const generatedCode = getGeneratedCode(typeName, typeSchema, imports);
  const importsCode = Array.from(imports).map((importName) => `import { ${importName} } from './${importName}';`).join('\n');
  const finalCode = importsCode ? `${importsCode}\n\n${generatedCode}` : generatedCode;

  await writeFile(`${targetDirectory}/${typeName}.ts`, finalCode);
}

function getGeneratedCode(typeName, typeSchema, imports) {
  const generatedType = getGeneratedType(typeSchema, imports);
  return `export type ${typeName} = ${generatedType};`;
}

function resolveReference(ref) {
  const parts = ref.split('/');
  let schema = openapi;
  for (const part of parts.slice(1)) {
    schema = schema[part];
  }
  return schema;
}

function handleAllOf(schema, imports) {
  if (!schema.allOf) return null;

  const parts = [];
  let inlineProps = null;

  for (const part of schema.allOf) {
    if (part.$ref) {
      const refType = part.$ref.split('/').pop();
      imports.add(refType);
      parts.push(refType);
    } else if (part.type === "object" && part.properties) {
      // Handle inline object properties
      const properties = part.properties;
      const requiredFields = part.required || [];
      
      const propertyDefinitions = Object.entries(properties).map(([propName, propSchema]) => {
        const isRequired = requiredFields.includes(propName);
        const propertyType = getPropertyType(propSchema, imports);
        return `  ${propName}${isRequired ? '' : '?'}: ${propertyType};`;
      });

      inlineProps = `{\n${propertyDefinitions.join('\n')}\n}`;
    }
  }

  if (parts.length === 0 && inlineProps) {
    return inlineProps;
  } else if (parts.length > 0 && inlineProps) {
    return `${parts.join(' & ')} & ${inlineProps}`;
  } else if (parts.length > 0) {
    return parts.join(' & ');
  }

  return null;
}

function handleOneOf(schema, imports) {
  if (!schema.oneOf) return null;
  
  const types = schema.oneOf.map(item => {
    if (item.$ref) {
      const refType = item.$ref.split('/').pop();
      imports.add(refType);
      return refType;
    }
    return getGeneratedType(item, imports);
  });
  
  return `(${types.join(' | ')})`;
}

function getPropertyType(property, imports) {
  // Handle allOf references
  const allOfType = handleAllOf(property, imports);
  if (allOfType) return allOfType;

  // Handle oneOf references
  const oneOfType = handleOneOf(property, imports);
  if (oneOfType) return oneOfType;

  // Handle direct references
  if (property.$ref) {
    const refType = property.$ref.split('/').pop();
    imports.add(refType);
    return refType;
  }

  return getGeneratedType(property, imports);
}

function getGeneratedType(typeSchema, imports) {
  // Handle allOf combinations first
  const allOfType = handleAllOf(typeSchema, imports);
  if (allOfType) return allOfType;

  // Handle oneOf references
  const oneOfType = handleOneOf(typeSchema, imports);
  if (oneOfType) return oneOfType;

  // Handle direct references
  if (typeSchema.$ref) {
    const refType = typeSchema.$ref.split('/').pop();
    imports.add(refType);
    return refType;
  }

  const schemaType = typeSchema.type;

  switch (schemaType) {
    case "object": {
      if (!typeSchema.properties) {
        return "Record<string, unknown>";
      }

      const properties = typeSchema.properties;
      const requiredFields = typeSchema.required || [];
      
      const propertyDefinitions = Object.entries(properties).map(([propName, propSchema]) => {
        const isRequired = requiredFields.includes(propName);
        const propertyType = getPropertyType(propSchema, imports);
        return `  ${propName}${isRequired ? '' : '?'}: ${propertyType};`;
      });

      return `{\n${propertyDefinitions.join('\n')}\n}`;
    }

    case "array": {
      const itemSchema = typeSchema.items;
      // Handle oneOf in array items
      const oneOfArrayType = handleOneOf(itemSchema, imports);
      if (oneOfArrayType) {
        return `${oneOfArrayType}[]`;
      }
      
      if (itemSchema.$ref) {
        const refType = itemSchema.$ref.split('/').pop();
        imports.add(refType);
        return `${refType}[]`;
      }
      
      if (itemSchema.type === "string") {
        return "string[]";
      } else if (itemSchema.type === "number" || itemSchema.type === "integer") {
        return "number[]";
      } else if (itemSchema.type === "boolean") {
        return "boolean[]";
      }
      
      const itemType = getGeneratedType(itemSchema, imports);
      return `${itemType}[]`;
    }

    case "string":
      if (typeSchema.enum) {
        return typeSchema.enum.map(val => `'${val}'`).join(' | ');
      }
      return "string";

    case "number":
    case "integer":
      return "number";

    case "boolean":
      return "boolean";

    default:
      if (typeSchema.properties) {
        return getGeneratedType({ ...typeSchema, type: 'object' }, imports);
      }
      return "unknown";
  }
}

generateSpotifyClient();