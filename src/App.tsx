import logo from './assets/logo.svg';
import './App.css';
import { SavedTrack, Track } from 'spotify-types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const apiToken =
  'BQCAxifN1wqfn9udcEKJRHLMIeviNNKWNkTxToVaugDxwQ7BVePmD8rfwC7Qm5DgwR6Cq0wIxZPDRmnMPzPZ8FJNsIrPY4zce4xhQ1WZLPDlmD99PecrkeHdMFXeUvYyur3aPYs5fREZelS7VvaJZKhT1woZ9hyy6FpXxe2_Oq2Swg-IvTZds9fKSxUDybo8DlLVTOdp-rnamNzJXS_UDbhA3a8qil4uiisVDAiPqltkN-UFwGdgDTCIr8drqigDzhB9pUxqrQNMiUHwVQOtoo3YR305hfurlKp6keQZKuSp6isQYateUjd_hIXlQP5kKzuXmtC_wyYTTyDO7ONt';

const fetchTracks = async () => {
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

const AlbumCover = ({ track }: { track: Track }) => {
  return (
    <img
      src={track.album.images?.[0]?.url ?? ''}
      style={{ width: 400, height: 400 }}
    />
  );
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
            <AlbumCover track={selectedTrack} />
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
