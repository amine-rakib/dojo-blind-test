import logo from './assets/logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { getUsersSavedTracks } from './lib/spotify/api/tracks/tracks';
import { GetUsersSavedTracksParams } from './lib/spotify/model';

const apiToken =
  'BQAP0oxaa9F-nyvVFc6aDrbJqMp8MbolFfHKOPACP6q6R0r7n83xj6ase-ePbd6uQucQEqOVbeyRddmHsT_q7MWxUFqYpX2XT_BEyfKL3gVN_ilZZ-UufyhcL5pl86ATSVtmiTsKYthMMlDwsMDXdqTkbj6GFfkiaClxG5ks0EbuAv6sG5ylFYzSeQV0QIRedZrk8pV9T0NyMCwHW2ry-6A_Tlmr9Q';

const fetchTracks = async (params?: GetUsersSavedTracksParams) => {
  return getUsersSavedTracks(params, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  }).then(
    response => response.data.items,
    error => {
      console.error(error);
    },
  );
};

const pickRandomTrack = (tracks: any[]) => {
  return tracks[Math.floor(Math.random() * tracks.length)]!;
};

const shuffleArray = (tracks: any[]) => {
  return tracks.sort(() => Math.random() - 0.5);
};

const AlbumCover = ({ track }: { track: any }) => {
  return (
    <img
      src={track.album.images?.[0]?.url ?? ''}
      style={{ width: 200, height: 200 }}
    />
  );
};

const TrackButton = ({
  track,
  onClick,
}: {
  track: any;
  onClick: () => void;
}) => {
  return (
    <div className="App-track-button">
      <AlbumCover track={track.track} />
      <button onClick={onClick}>{track.track?.name}</button>
    </div>
  );
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });

  const [currentTrack, setCurrentTrack] = useState<any | undefined>(
    undefined,
  );
  const [trackChoices, setTrackChoices] = useState<any[]>([]);

  useEffect(() => {
    if (!tracks) {
      return;
    }

    const rightTrack = pickRandomTrack(tracks);
    setCurrentTrack(rightTrack);

    const wrongTracks = [pickRandomTrack(tracks), pickRandomTrack(tracks)];
    const choices = shuffleArray([rightTrack, ...wrongTracks]);
    setTrackChoices(choices);
  }, [tracks]);

  const checkAnswer = (track: any) => {
    if (track.track?.id == currentTrack?.track?.id) {
      swal('Bravo !', "C'est la bonne réponse", 'success');
    } else {
      swal('Dommage !', "Ce n'est pas la bonne réponse", 'error');
    }
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
