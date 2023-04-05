import logo from './assets/logo.svg';
import './App.css';
import { SavedTrack } from 'spotify-types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const apiToken = '';

export const fetchTracks = async () => {
  const response = await fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + apiToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetching tracks failed with status ${response.status}`);
  }
  const data = (await response.json()) as { items: SavedTrack[] };

  return data.items;
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  const goToNextTrack = () => {
    if (isSuccess) {
      setSelectedTrackIndex((selectedTrackIndex + 1) % tracks?.length);
    }
  };

  const selectedTrack = tracks?.[selectedTrackIndex]?.track;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Bienvenue sur le blind test</h1>
      </header>
      <div className="App-images">
        {isLoading || !isSuccess ? (
          'Loading...'
        ) : (
          <div>
            <h2>{`${selectedTrack?.name} (${selectedTrackIndex + 1} / ${
              tracks.length
            })`}</h2>
            <div>
              <audio src={selectedTrack?.preview_url ?? ''} controls autoPlay />
            </div>
            <button onClick={goToNextTrack}>Next track</button>
          </div>
        )}
      </div>
      <div className="App-buttons"></div>
    </div>
  );
};

export default App;
