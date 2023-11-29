import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

const generateSpotifyClient = async () => {
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

const generateType = (typeName, typeSchema) => {  
  console.log(`Generating type ${typeName}...`);

  const generatedType = getGeneratedType(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedType);
}

const getGeneratedType = (type, schema) => {
  // TO DO: Generate typescript code from schema
  return "";
}

generateSpotifyClient();