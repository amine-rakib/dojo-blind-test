import logo from './assets/logo.svg';
import './App.css';
import { SavedTrack, Track } from 'spotify-types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';

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

const shuffleArray = <T,>(tracks: Array<T>) => {
  return tracks.sort(() => Math.random() - 0.5);
};

const TrackButton = ({
  track,
  onClick,
}: {
  track: SavedTrack;
  onClick: () => void;
}) => {
  return <button onClick={onClick}>{track.track?.name}</button>;
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });

  const [currentTrack, setCurrentTrack] = useState<SavedTrack | undefined>(
    undefined,
  );
  const [trackChoices, setTrackChoices] = useState<SavedTrack[]>([]);

  const setUpGame = () => {
    if (!tracks) {
      return;
    }

    const [rightTrack, wrongTrack1, wrongTrack2, ...rest] =
      shuffleArray(tracks);
    if (!rightTrack || !wrongTrack1 || !wrongTrack2) {
      return;
    }
    setCurrentTrack(rightTrack);
    setTrackChoices(shuffleArray([rightTrack, wrongTrack1, wrongTrack2]));
  };

  useEffect(() => {
    setUpGame();
  }, [tracks]);

  const checkAnswer = (track: SavedTrack) => {
    if (track.track?.id == currentTrack?.track?.id) {
      swal('Bravo !', "C'est la bonne réponse", 'success');
    } else {
      swal('Dommage !', "Ce n'est pas la bonne réponse", 'error');
    }
    setUpGame();
  };

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
            <div>
              <audio
                src={currentTrack?.track?.preview_url ?? ''}
                controls
                autoPlay
              />
            </div>
          </div>
        )}
      </div>
      <div className="App-buttons">
        {trackChoices.map(track => (
          <TrackButton track={track} onClick={() => checkAnswer(track)} />
        ))}
      </div>
    </div>
  );
};

export default App;
