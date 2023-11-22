module.exports = {
    spotify: {
      output: {
        mode: 'tags-split',
        target: 'src/lib/spotify/api/spotify.ts',
        schemas: 'src/lib/spotify/model',
        client: 'swr',
        mock: true,
      },
      input: {
        target: './openapi.json',
      },
    },
  };