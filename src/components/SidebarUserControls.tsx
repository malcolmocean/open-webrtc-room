import {
  LocalMediaList,
  Media,
  MediaControls,
  UserControls,
  Video,
  RequestUserMedia
} from '@andyet/simplewebrtc';
import React from 'react';
import styled from 'styled-components';
import LocalMediaControls from './LocalMediaControls';
import Tooltip from './Tooltip';

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
  toggleActiveSpeakerView: () => void;
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
  toggleActiveSpeakerView,
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
              let videos = media.filter(m => m.kind === 'video');
              // videos = videos.filter((m, ix) => !ix || m.id !== videos[0].id) // remove dupes - to deal with a situation when firefox is being slow where double-clicking the send-video button can result in multiple streams
              // doesn't actually work though because same cam but different media id
              if (videos.length > 0) {
                return (
                  <>
                    {videos.map(m =>
                      <LocalMediaView key={m.id} media={m} />
                    )}
                  </>
                );
              }

              return <div />;
            }}
          />
        </LocalVideo>
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
