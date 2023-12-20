import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema) {
  let imports = [];

  const generatedType = getGeneratedType(typeSchema, imports, 0);

  const generatedImports = imports.map((importName) => `import { ${importName} } from "./${importName}";`).join("\n");
  const separator = imports.length > 0 ? "\n\n" : "";
  const generatedExport = `export type ${typeName} = ${generatedType};`;

  return `${generatedImports}${separator}${generatedExport}`;
}

function getGeneratedType(typeSchema, imports, indentationLevel) {
  const schemaType = typeSchema.type;

  if (typeSchema.allOf !== undefined) {
    return getGeneratedAllOf(typeSchema.allOf, imports, indentationLevel);
  }
  if (typeSchema.oneOf !== undefined) {
    return getGeneratedOneOf(typeSchema.oneOf, imports, indentationLevel);
  }
  if (typeSchema.$ref !== undefined) {
    updateImports(imports, typeSchema.$ref);
    return getGeneratedRef(typeSchema.$ref);
  }

  switch (schemaType) {
    case "number":
    case "integer":
      return "number";
    case "string":
      if (typeSchema.enum !== undefined) {
        return getGeneratedEnum(typeSchema.enum);
      }
      return "string";
    case "boolean":
      return "boolean";
    case "array":
      return `${getGeneratedType(typeSchema.items, imports, indentationLevel)}[]`;
    case "object":
      return getGeneratedObject(typeSchema, imports, indentationLevel);
    default:
      return "";
  }
}

function getGeneratedObject(typeSchema, imports, indentationLevel) {

  const properties = typeSchema.properties ?? {};
  const required = typeSchema.required ?? [];

  const generatedProperties = Object.keys(properties).map((propertyName) => {
    const property = properties[propertyName];
    const isRequired = required.includes(propertyName);

    const generatedProperty = getGeneratedType(property, imports, indentationLevel + 1);

    return `${propertyName}${isRequired ? "" : "?"}: ${generatedProperty};`;
  });
  
  const indentation = "  ".repeat(indentationLevel);
  const lineBreakWithIndentation = `\n${indentation}  `;
  return `{${lineBreakWithIndentation}${generatedProperties.join(lineBreakWithIndentation)}\n${indentation}}`;
}

function getGeneratedAllOf(allOf, imports, indentationLevel) {
  const generatedTypes = allOf.map((schema) => getGeneratedType(schema, imports, indentationLevel));

  return `(${generatedTypes.join(" & ")})`;
}

function getGeneratedOneOf(oneOf, imports, indentationLevel) {
  const generatedTypes = oneOf.map((schema) => getGeneratedType(schema, imports, indentationLevel));

  return `(${generatedTypes.join(" | ")})`;
}

function updateImports(imports, ref) {
  const refName = getGeneratedRef(ref);

  if (imports.includes(refName)) return;

  imports.push(refName);
}

function getGeneratedRef(ref) {
  const refName = ref.split("/").pop();

  return refName;
}

function getGeneratedEnum(enumValues) {
  return enumValues.map((enumValue) => `"${enumValue}"`).join(" | ");
}

generateSpotifyClient();