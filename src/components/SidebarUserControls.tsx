import {
  LocalMediaList,
  Media,
  MediaControls,
  UserControls,
  Video,
  RequestUserMedia,
  VolumeMeter
} from '@andyet/simplewebrtc';
import React from 'react';
import styled from 'styled-components';
import LocalMediaControls from './LocalMediaControls';
import Tooltip from './Tooltip';
import { default as MyVolumeMeter } from './VolumeMeter';

const Volume = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'middle'
});

const LocalVideo = styled.div({
  position: 'relative',
  '& input': {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 100,
    width: '100%',
    boxSizing: 'border-box',
    border: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontSize: '14px',
    padding: '8px'
  },
  '& video': {
    display: 'block',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    // marginBottom: '10px'
  }
});

const RoomModeToggles = styled.div({
  marginBottom: '10px',
  '& input': {
    marginRight: '5px'
  },
  '& label': {
    fontWeight: 'bold',
    fontSize: '12px'
  }
});

const EmptyVideo = styled.div({
  width: '100%',
  height: '133px',
  backgroundColor: '#262a2c',
  marginBottom: '10px'
});

const ToggleContainer = styled.label({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '5px'
});

interface Props {
  activeSpeakerView: boolean;
  // toggleActiveSpeakerView: () => void;
  pttMode: boolean;
  togglePttMode: (e: React.SyntheticEvent<Element>) => void;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  chooseDevices: () => void;
}

interface LocalMediaProps {
  media: Media;
}

const LocalMediaContainer = styled.div({
  position: 'relative'
});

const LocalMediaOverlay = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'black',
  opacity: 0,
  transition: 'opacity 200ms linear',
  color: 'white',
  zIndex: 100,
  '&:hover': {
    cursor: 'pointer',
    opacity: 0.8
  }
});

const LocalMediaView: React.SFC<LocalMediaProps> = ({ media }) => (
  <MediaControls
    media={media}
    autoRemove={true}
    render={({ media, stopSharing }) => (
      <LocalMediaContainer>
        <LocalMediaOverlay onClick={stopSharing}>
          <span>Stop sharing</span>
        </LocalMediaOverlay>
        {media && <Video media={media!} />}
      </LocalMediaContainer>
    )}
  />
);

const SidebarUserControls: React.SFC<Props> = ({
  activeSpeakerView,
  // toggleActiveSpeakerView,
  pttMode,
  togglePttMode,
  allowShareScreen,
  allowWalkieTalkieMode,
  chooseDevices,
}) => (
  <UserControls
    render={({
      hasAudio,
      hasVideo,
      hasScreenCapture,
      isMuted,
      mute,
      unmute,
      isPaused,
      isSpeaking,
      isSpeakingWhileMuted,
      pauseVideo,
      resumeVideo,
      user,
    }) => (
      <div>
        <LocalVideo>
          <LocalMediaList
            shared={true}
            render={({ media }) => {
              const videoStreams = media.filter(m => m.kind === 'video' && !m.remoteDisabled);
              const webcamStreams = videoStreams.filter(s => !s.screenCapture);
              const screenStreams = videoStreams.filter(s => s.screenCapture);
              // doesn't actually work though because same cam but different media id
              return (
                <>
                  {!webcamStreams.length ? null : <LocalMediaView key={webcamStreams[0].id} media={webcamStreams[0]} />}
                  {!screenStreams.length ? null : <LocalMediaView key={screenStreams[0].id} media={screenStreams[0]} />}
                </>
              )
            }}
          />
        </LocalVideo>
        <LocalMediaList
          shared={true}
          render={({ media }) => {
            const audio = media.find(m => m.kind === 'audio');
            if (!audio) {return null}
            return (<VolumeMeter
              media={audio}
              noInputTimeout={7000}
              render={({ noInput, volume, speaking }) => {
                console.log('volume', volume)
                console.log('speaking', speaking)
                return (
                <Volume>
                  <MyVolumeMeter
                    buckets={10}
                    volume={-volume}
                    speaking={speaking}
                    loaded={!!audio.loaded}
                    noInput={noInput}
                    requesting={false}
                  />
                </Volume>
              )}}
            />)
          }}
        />
        <LocalMediaControls
          hasAudio={hasAudio}
          hasVideo={hasVideo}
          hasScreenCapture={hasScreenCapture}
          isMuted={isMuted}
          unmute={() => {
            unmute();
          }}
          mute={mute}
          isPaused={isPaused}
          resumeVideo={() => resumeVideo({ screenCapture: false })}
          pauseVideo={() => pauseVideo({ screenCapture: false })}
          isSpeaking={isSpeaking}
          isSpeakingWhileMuted={isSpeakingWhileMuted}
          allowShareScreen={allowShareScreen}
          chooseDevices={() => chooseDevices()}
        />
        <RoomModeToggles>
          {allowWalkieTalkieMode && (
            <div>
              <ToggleContainer>
                <input type="checkbox" checked={pttMode} onChange={togglePttMode} />
                Walkie Talkie Mode
                <Tooltip text="Use spacebar to toggle your microphone on/off" />
              </ToggleContainer>
            </div>
          )}
        </RoomModeToggles>
      </div>
    )}
  />
);

export default SidebarUserControls;
