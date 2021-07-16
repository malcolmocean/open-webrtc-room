import { RequestUserMedia, RequestDisplayMedia, Actions } from '@andyet/simplewebrtc';
import { connect } from 'react-redux';

import SettingsIcon from 'material-icons-svg/components/baseline/Settings';
import MicIcon from 'material-icons-svg/components/baseline/Mic';
import MicOffIcon from 'material-icons-svg/components/baseline/MicOff';
import VideocamIcon from 'material-icons-svg/components/baseline/Videocam';
import VideocamOffIcon from 'material-icons-svg/components/baseline/VideocamOff';
import ShareScreenIcon from 'material-icons-svg/components/baseline/ScreenShare';
import React, { useContext } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { TalkyButton } from '../styles/button';
import mq from '../styles/media-queries';
import { deviceSupportsVolumeMonitoring } from '../utils/isMobile';
import { AudioModes } from '../contexts/AudioModes';

const HIDE_SETTINGS_FOR_NOW = true

interface MutePauseButtonProps {
  isOff: boolean;
  height?: string;
}

const AudioButton = styled(TalkyButton)<MutePauseButtonProps>`
  ${props =>
    !props.isOff ? css`font-weight: bold;` : ''
  }
`;

const VideoButton = styled(TalkyButton)(({ isOff, height }: MutePauseButtonProps) => ({
  height: height,
}))

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
  return (hasVideo && hasScreenCapture ? null : <Container isInline={isInline} className={`tintbg ${isInline ? 'reactroom-media-send-btns-inline' : 'reactroom-media-send-btns'}`}>
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
    {!allowShareScreen || hasScreenCapture ? null : <RequestDisplayMedia
      audio={audioModeType !== 'never'}
      volumeMonitoring={deviceSupportsVolumeMonitoring()}
      render={(getDisplayMedia, sharing) => {
        if (!sharing.available) {
          return <div>(no screensharing available)</div>
        }

        return (
          <TalkyButton title="Screen Share" onClick={getDisplayMedia}>
            <ShareScreenIcon fill="#505658" />
            <span>Share Screen</span>
          </TalkyButton>
        );
      }}
    />}
    {!chooseDevices || HIDE_SETTINGS_FOR_NOW ? null :
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
