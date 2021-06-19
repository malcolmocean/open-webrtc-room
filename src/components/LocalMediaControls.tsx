import { RequestUserMedia, Actions } from '@andyet/simplewebrtc';
import { connect } from 'react-redux';

import SettingsIcon from 'material-icons-svg/components/baseline/Settings';
import MicIcon from 'material-icons-svg/components/baseline/Mic';
import MicOffIcon from 'material-icons-svg/components/baseline/MicOff';
import VideocamIcon from 'material-icons-svg/components/baseline/Videocam';
import VideocamOffIcon from 'material-icons-svg/components/baseline/VideocamOff';
import React, { useContext } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { TalkyButton } from '../styles/button';
import mq from '../styles/media-queries';
import ScreenshareControls from './ScreenshareControls';
import { AudioModes } from '../contexts/AudioModes';

interface MutePauseButtonProps {
  isFlashing?: boolean;
  isOff: boolean;
}

const pulseKeyFrames = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: .25;
  }
  100% {
    opacity: 1;
  }
`;

  // background-color: ${props => (props.isOff ? '#e60045' : '')};
  // &:not(:hover) svg {
  //   fill: ${props => (props.isOff ? 'white' : '')};
  // }
  // &:hover svg {
  //   fill: '';
  // }
const AudioButton = styled(TalkyButton)<MutePauseButtonProps>`
  ${props =>
    !props.isOff ? css`font-weight: bold;` : ''
  }
  ${props =>
    props.isFlashing
      ? css`
          animation: ${pulseKeyFrames} 0.5s ease-in-out infinite;
        `
      : ''}
`;
  // }

const VideoButton = styled(TalkyButton)(({ isOff }: MutePauseButtonProps) => ({
}))
// const VideoButton = styled(TalkyButton)(({ isOff }: MutePauseButtonProps) => ({
//   backgroundColor: isOff ? '#e60045' : '',
//   '& svg': {
//     fill: isOff ? 'white' : ''
//   }
// }));

interface ContainerProps {
  isInline: boolean;
}

const FlexContainer = styled.div`
  display: flex;
`

const Container = styled(FlexContainer)<ContainerProps>`
  flex-direction: ${props => props.isInline ? 'row' : 'column'};
`;

interface LocalMediaControlsProps {
  hasAudio: boolean;
  hasVideo: boolean;
  hasScreenCapture: boolean;
  isMuted: boolean;
  unmute: () => void;
  mute: () => void;
  isPaused: boolean;
  isSpeaking: boolean;
  isSpeakingWhileMuted: boolean;
  resumeVideo: () => void;
  pauseVideo: () => void;
  allowShareScreen: boolean;
  removeAllAudio?: () => void;
  removeAllVideo?: () => void;
  chooseDevices?: () => void;
  isInline?: boolean;
}

// LocalMediaControls displays buttons to toggle the mute/pause state of the
// user's audio/video.
const LocalMediaControls: React.SFC<LocalMediaControlsProps> = ({
  hasAudio,
  hasVideo,
  hasScreenCapture,
  isMuted,
  unmute,
  mute,
  isPaused,
  isSpeakingWhileMuted,
  resumeVideo,
  pauseVideo,
  allowShareScreen,
  removeAllAudio,
  removeAllVideo,
  chooseDevices,
  isInline=false,
}) => {
  const { audioMode, audioModeType } = useContext(AudioModes);
  console.log('audioModeType', audioModeType)
  return (<Container isInline={isInline} className={`tintbg ${isInline ? 'reactroom-media-send-btns-inline' : 'reactroom-media-send-btns'}`}>
    {audioModeType == 'never' ? null : <RequestUserMedia
      audio={{
        deviceId: {
          ideal: localStorage.preferredAudioDeviceId
        }
      }}
      share={true}
      render={(getMedia, captureState) => (
        <AudioButton
          isOff={isMuted}
          isFlashing={isSpeakingWhileMuted}
          onClick={() => {
            if (captureState.requestingCapture) {
              return;
            } else if (!hasAudio) {
              getMedia({ audio: true });
            } else if (isMuted) {
              unmute();
            } else {
              mute();
              if (removeAllAudio) removeAllAudio();
            }
          }}
        >
          {hasAudio && isMuted ? <MicOffIcon /> : <MicIcon />}
          <span>{isMuted ? "Share Audio" : "Mute Audio"}</span>
        </AudioButton>
      )}
    />}
    <RequestUserMedia
      video={{
        deviceId: {
          ideal: localStorage.preferredVideoDeviceId
        }
      }}
      share={true}
      render={(getMedia, captureState) => (
        hasVideo ? null : <VideoButton
          isOff={isPaused}
          onClick={() => {
            if (captureState.requestingCapture) {
              return;
            } else if (!hasVideo) {
              getMedia({ video: true });
            } else if (isPaused) {
              resumeVideo();
            } else {
              pauseVideo();
              if (removeAllVideo) removeAllVideo();
            }
          }}
        >
          {/*{isPaused ? <VideocamOffIcon /> : <VideocamIcon />}*/}
          <VideocamIcon />
          <span>{isPaused ? "Share Video" : "Stop Video"}</span>
        </VideoButton>
      )}
    />
    {allowShareScreen && !hasScreenCapture ? <ScreenshareControls /> : null}
    {!chooseDevices ? null :
    <TalkyButton onClick={() => {
      if (removeAllAudio) removeAllAudio();
      if (removeAllVideo) removeAllVideo();
      chooseDevices();
    }}>
      <SettingsIcon />
      <span>Settings</span>
    </TalkyButton>
    }
  </Container>
)};

function mapDispatchToProps(
  dispatch: any,
  props: LocalMediaControlsProps
): LocalMediaControlsProps {
  return {
    ...props,
    removeAllAudio: () => dispatch(Actions.removeAllMedia('audio')),
    removeAllVideo: () => dispatch(Actions.removeAllMedia('video'))
  };
}

export default connect(null, mapDispatchToProps)(LocalMediaControls);
