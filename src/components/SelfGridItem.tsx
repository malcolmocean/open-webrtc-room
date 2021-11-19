import {
  LocalMediaList,
  UserControls,
  MediaControls,
  RequestUserMedia,
  RequestDisplayMedia,
  Actions,
  Media,
} from '@andyet/simplewebrtc';
import MicIcon from 'material-icons-svg/components/baseline/Mic';
import MicOffIcon from 'material-icons-svg/components/baseline/MicOff';
import VideocamIcon from 'material-icons-svg/components/baseline/Videocam';
import VideocamOffIcon from 'material-icons-svg/components/baseline/VideocamOff';
import ShareScreenIcon from 'material-icons-svg/components/baseline/ScreenShare';
import SettingsIcon from 'material-icons-svg/components/baseline/Settings';

import React, { Component, useContext } from 'react';
import { connect } from 'react-redux';
import { AudioModes } from '../contexts/AudioModes';
import ChooseDevices from '../contexts/ChooseDevices';
import styled, { css } from 'styled-components';
import { deviceSupportsVolumeMonitoring } from '../utils/isMobile';

import {OverlayButton, UserBox, GridItemMedia, Overlay } from './GridItem';

const SelfOverlayButton = styled(OverlayButton)`
  position: absolute;
  left: -1px;
`
const CameraButton = styled(SelfOverlayButton)`
  top: 104px;
`
const ScreenButton = styled(SelfOverlayButton)`
  top: 137px;
`
const AudioButton = styled(SelfOverlayButton)`
  top: 170px;
`
const SettingsButton = styled(SelfOverlayButton)`
  top: 203px;
`

interface SelfGridItemOverlayProps {
  allowShareScreen: boolean;
  removeAllAudio?: () => void;
  removeAllVideo?: () => void;
  removeLocalMedia?: (id: string) => void;
  stopSharingLocalMedia?: (id: string) => void;
  myCamera?: Media,
  myScreen?: Media,
}
const SelfGridItemOverlay: React.SFC<SelfGridItemOverlayProps> = ({
  allowShareScreen,
  removeAllAudio,
  removeAllVideo,
  removeLocalMedia,
  stopSharingLocalMedia,
  myCamera,
  myScreen,
}) => {
  const { currentAudioState, audioModeType } = useContext(AudioModes);
  const { chooseDevices } = useContext(ChooseDevices);
  return (
    <Overlay>
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
          <div className='reactroom-user-box-buttons'>
            {hasVideo && !isPaused && myCamera ? <MediaControls
                media={myCamera}
                autoRemove={true}
                render={({ media, stopSharing }) => (
                  <CameraButton onClick={stopSharing}>
                    <VideocamOffIcon />
                    <span>Stop Video</span>
                  </CameraButton>
                )}
              />
              :
              <RequestUserMedia
                video={{deviceId: {ideal: localStorage.preferredVideoDeviceId}}}
                share={true}
                render={(getMedia, captureState) => (
                  <CameraButton
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
                    <VideocamIcon />
                    <span>Share Video</span>
                  </CameraButton>
                )}
              />
            }
            {!allowShareScreen ? null : (
              hasScreenCapture && myScreen ? <MediaControls
                media={myScreen}
                autoRemove={true}
                render={({ media, stopSharing }) => (
                  <ScreenButton onClick={stopSharing}>
                    <ShareScreenIcon />
                    <span>Stop Screenshare</span>
                  </ScreenButton>
                )}
              />
              :
              <RequestDisplayMedia
              audio={audioModeType !== 'never'}
              volumeMonitoring={deviceSupportsVolumeMonitoring()}
              render={(getDisplayMedia, sharing) => {
                if (!sharing.available) {return null} // <div>(no screensharing available)</div>

                return <ScreenButton title="Share Screen" onClick={getDisplayMedia}>
                  <ShareScreenIcon fill="#505658" />
                  <span>Share Screen</span>
                </ScreenButton>
              }}
            />)}
            {audioModeType == 'never' ? null :
              <RequestUserMedia
                audio={{deviceId: {ideal: localStorage.preferredAudioDeviceId}}}
                share={true}
                render={(getMedia, captureState) => (
                  <AudioButton
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
              />
            }
            <SettingsButton onClick={() => {
              if (myCamera) {
                if (removeLocalMedia) removeLocalMedia(myCamera.id);
                if (stopSharingLocalMedia) stopSharingLocalMedia(myCamera.id);
              }
              if (removeAllAudio) removeAllAudio();
              // if (removeAllVideo) removeAllVideo(); // removes screenshare
              chooseDevices(true);
            }}>
              <SettingsIcon />
              <span>Settings</span>
            </SettingsButton>
          </div>
        )}
      />
    </Overlay>
  );
};

interface SelfGridItemProps {
  roomAddress: string;
  pttMode: boolean;
  togglePttMode: (e: React.SyntheticEvent) => void;
  roomId: string;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  removeAllAudio?: () => void;
  removeAllVideo?: () => void;
  removeLocalMedia?: (id: string) => void;
  stopSharingLocalMedia?: (id: string) => void;
}

interface State {}

// const SelfGridItem: React.SFC<Props, State> = ({
class SelfGridItem extends Component<SelfGridItemProps, State> {
  constructor(props: SelfGridItemProps) {
    super(props)
    this.state = {}
  }
  public render() {
    const {
      roomAddress,
      pttMode,
      togglePttMode,
      roomId,
      allowShareScreen,
      allowWalkieTalkieMode,
      removeAllAudio,
      removeAllVideo,
      removeLocalMedia,
      stopSharingLocalMedia,
    } = this.props;
      return (
      <UserBox>
        <LocalMediaList
          shared={true}
          render={({ media }) => {
            const videoStreams = media.filter(m => m.kind === 'video' && !m.remoteDisabled);
            const webcamStreams = videoStreams.filter(s => !s.screenCapture);
            const screenStreams = videoStreams.filter(s => s.screenCapture);
            return <>
              <SelfGridItemOverlay
                allowShareScreen={allowShareScreen}
                removeAllAudio={removeAllAudio!}
                removeAllVideo={removeAllVideo!}
                removeLocalMedia={removeLocalMedia!}
                stopSharingLocalMedia={stopSharingLocalMedia!}
                myCamera={webcamStreams[0]}
                myScreen={screenStreams[0]}
              />
              <GridItemMedia media={media} name='' peerId='self' />
            </>
          }}
        />
      </UserBox>
    )
  }
}

function mapDispatchToProps(
  dispatch: any,
  props: SelfGridItemProps
): SelfGridItemProps {
  return {
    ...props,
    removeAllAudio: () => dispatch(Actions.removeAllMedia('audio')),
    removeAllVideo: () => dispatch(Actions.removeAllMedia('video')),
    removeLocalMedia: (id: string) => dispatch(Actions.removeMedia(id)),
    stopSharingLocalMedia: (id: string) => dispatch(Actions.stopSharingLocalMedia(id)),
  };
}

export default connect(null, mapDispatchToProps)(SelfGridItem);
