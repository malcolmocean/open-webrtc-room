import {
  DeviceList,
  LocalMediaList,
  Media,
  RequestUserMedia,
  UserControls,
  VolumeMeter
} from '@andyet/simplewebrtc';
import MicIcon from 'material-icons-svg/components/baseline/Mic';
import VideocamIcon from 'material-icons-svg/components/baseline/Videocam';
import VolumeUpIcon from 'material-icons-svg/components/baseline/VolumeUp';
import React, { useContext } from 'react';
import styled, { css } from 'styled-components';

import { AudioModes } from '../contexts/AudioModes';

import Placeholders from '../contexts/Placeholders';
import { TalkyButton } from '../styles/button';
import mq from '../styles/media-queries';
import { colorToString } from '../utils/colorify';
import { deviceSupportsVolumeMonitoring } from '../utils/isMobile';

import { Error, Info } from './Alerts';
import MediaPreview from './MediaPreview';
import { default as Meter } from './VolumeMeter';

import Tooltip from './Tooltip';

// import { createSoundPlayer, initSounds } from '../utils/sounds';

const hasTestOutput = false // getConfigFromMetaTag('sound-test-output');

const Container = styled.div({
  backgroundColor: '#6663',
  paddingBottom: '10px',
  display: 'grid',
  gridTemplateAreas: `
    'header'
    'preview'
    'controls'
  `,
  gridRowGap: '10px',
  gridColumnGap: '10px',
  [mq.SMALL_DESKTOP]: {
    gridTemplateAreas: `
      'header header'
      'preview controls'
    `
  }
});

const Header = styled.div({
  gridArea: 'header'
});

const Controls = styled.div`
  grid-area: controls;
  padding: 0 10px;
  ${mq.SMALL_DESKTOP} {
    padding: 0;
    width: 330px;
  }
  select {
    height: 30px;
    padding: 5px;
    font-size: 12px;
  }
  label {
    display: block;
    font-weight: bold;
    font-size: 12px;
    margin: 10px 0;
    position: relative;
    padding-left: 25px;

    svg {
      font-size: 20px;
      vertical-align: bottom;
      margin-right: 5px;
      fill: ${({ theme }) => colorToString(theme.foreground)};
    }
    .reactroom-left-icon {
      position: absolute;
      left: 0;
      top: 5px;
    }

    div {
      height: 25px;
      padding: 5px;
    }
  }
`;

const Preview = styled.div({
  gridArea: 'preview',
  display: 'flex',
  alignItems: 'flex-end',
  flexDirection: 'column'
});

const PermissionButton = styled(TalkyButton)({
  marginBottom: '5px',
  width: '100%'
});

const Volume = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'middle'
});

const AcceptButtonContainer = styled.div({
  marginTop: '10px',
  textAlign: 'center'
});

const AcceptButton = styled(TalkyButton)`
  margin-top: 20px;
  background-color: ${({ theme }) => colorToString(theme.buttonPrimaryBackground)};
  font-size: 22px;
  color: ${({ theme }) => colorToString(theme.buttonPrimaryText)};
  padding: 10px;
  :hover {
    background-color: ${({ theme }) => colorToString(theme.buttonPrimaryBackgroundHover)};
    color: ${({ theme }) => colorToString(theme.buttonPrimaryText)};
  }
  :active {
    background-color: ${({ theme }) => colorToString(theme.buttonPrimaryBackgroundActive)};
    color: ${({ theme }) => colorToString(theme.buttonPrimaryText)};
  }
  [disabled],
  :disabled {
    background-color: ${({ theme }) => colorToString(theme.buttonSecondaryBackground)};
  }
`;

const TestOutputButton = styled.span`
  color: ${({ theme }) => colorToString(theme.primaryBackground)};
  float: right;
`;

type GetMedia = (
  additional?: MediaStreamConstraints
) => Promise<{ audio?: string; video?: string }>;

export interface HaircheckProps {
  onAccept: () => void;
  audioModeType?: 'always' | 'sometimes' | 'never';
  currentAudioState?: 'on' | 'off';
}
export interface HaircheckState {
  allowInitialAutoCapture: boolean;
  previewAudioId?: string;
  previewVideoId?: string;
  testingOutput: boolean;
  showAccept?: boolean;
}

function getDeviceForTrack(devices: MediaDeviceInfo[], track: MediaStreamTrack) {
  let deviceId: string | undefined;
  const deviceLabel = track.label;
  const deviceKind = `${track.kind}input`;

  if (track.getSettings) {
    const settings = track.getSettings();
    deviceId = settings.deviceId;
  }

  if (deviceId) {
    for (const device of devices) {
      if (device.deviceId === deviceId) {
        return device;
      }
    }
  }
  for (const device of devices) {
    if (deviceLabel === device.label && deviceKind === device.kind) {
      return device;
    }
  }
}

class Haircheck extends React.Component<HaircheckProps, HaircheckState> {
  constructor(props: HaircheckProps) {
    super(props);

    this.state = {
      allowInitialAutoCapture: true,
      testingOutput: false,
      showAccept: false
    };
  }

  public componentDidMount() {
    setTimeout(() => {
      this.setState({
        showAccept: true
      });
    }, 1000);
  }

  public render() {
    return (
      <LocalMediaList
        screen={false}
        render={({ media, removeMedia, shareLocalMedia }) => {
          const currentAudioState = this.props.currentAudioState
          const audioModeType = this.props.audioModeType
          const previewVideo = media.filter(m => m.id === this.state.previewVideoId)[0];
          const previewAudio = media.filter(m => m.id === this.state.previewAudioId)[0];

          return (
            <Container>
              <Preview>
                <MediaPreview video={previewVideo} />
              </Preview>
              <Controls>
                <DeviceList
                  render={({
                    devices,
                    hasCamera,
                    requestingCameraCapture,
                    cameraPermissionDenied,
                    hasMicrophone,
                    requestingMicrophoneCapture,
                    microphonePermissionDenied,
                    cameraPermissionGranted,
                    microphonePermissionGranted,
                    requestingCapture
                  }) => {
                    const audioInputs = devices.filter(d => d.kind === 'audioinput');
                    const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
                    const videoInputs = devices.filter(d => d.kind === 'videoinput');

                    const currentAudioDevice = previewAudio
                      ? getDeviceForTrack(devices, previewAudio.track)
                      : undefined;
                    const currentVideoDevice = previewVideo
                      ? getDeviceForTrack(devices, previewVideo.track)
                      : undefined;

                    return (
                      <>
                        {this.initialAutoCapture(
                          microphonePermissionGranted,
                          cameraPermissionGranted,
                          requestingCapture,
                          audioModeType
                        )}
                        {audioModeType == 'never' ? null :
                        <div>
                          <UserControls
                            render={({ user, setAudioOutputDevice }) => (
                              <label>
                                <span className="reactroom-left-icon">
                                  <Tooltip text="Speaker">
                                    <VolumeUpIcon />
                                  </Tooltip>
                                </span>
                                {hasTestOutput && (
                                  <TestOutputButton
                                    onClick={async e => {
                                      e.preventDefault();
                                      this.setState({ testingOutput: true });
                                      // await throttledTestOutput(user.audioOutputDeviceId);
                                      this.setState({ testingOutput: false });
                                      return false;
                                    }}
                                  >
                                    {this.state.testingOutput ? 'Not implemented...' : 'Test Speaker'}
                                  </TestOutputButton>
                                )}
                                <select
                                  className="form-control"
                                  defaultValue={user.audioOutputDeviceId}
                                  disabled={!devices.length}
                                  onChange={e => {
                                    setAudioOutputDevice(e.target.value);
                                  }}
                                >
                                  {audioOutputs.length &&
                                    audioOutputs.map(device => (
                                      <option key={device.deviceId} value={device.deviceId}>
                                        {device.label}
                                      </option>
                                    ))}
                                  {!audioOutputs.length && (
                                    <option key="" value="">
                                      Default Audio Output
                                    </option>
                                  )}
                                </select>
                              </label>
                            )}
                          />
                        </div>
                        }
                        <div>
                          <label>
                            <span className="reactroom-left-icon">
                              <Tooltip text="Camera">
                                <VideocamIcon />
                              </Tooltip>
                            </span>
                            {this.renderInputSelector(
                              'video',
                              hasCamera,
                              cameraPermissionGranted,
                              cameraPermissionDenied,
                              requestingCameraCapture!,
                              videoInputs,
                              currentVideoDevice,
                              currentAudioDevice,
                              previewVideo,
                              previewAudio,
                              removeMedia,
                              'No cameras detected.',
                              'Camera permissions denied.',
                              'Requesting cameras...',
                              'Allow camera access',
                              'Disable Camera'
                            )}
                          </label>
                        </div>
                        {audioModeType == 'never' ? null :
                        <div>
                          <label>
                            <span className="reactroom-left-icon">
                              <Tooltip text="Microphone">
                                <MicIcon />
                              </Tooltip>
                            </span>
                            {this.renderInputSelector(
                              'audio',
                              hasMicrophone,
                              microphonePermissionGranted,
                              microphonePermissionDenied,
                              requestingMicrophoneCapture!,
                              audioInputs,
                              currentAudioDevice,
                              currentVideoDevice,
                              previewAudio,
                              previewVideo,
                              removeMedia,
                              'No microphones detected.',
                              'Microphone permissions denied.',
                              'Requesting microphones...',
                              'Allow microphone access',
                              'Disable Microphone'
                            )}
                          </label>
                          {!deviceSupportsVolumeMonitoring() || !hasMicrophone ? null : previewAudio ? (
                            <VolumeMeter
                              media={previewAudio}
                              noInputTimeout={7000}
                              render={({ noInput, volume, speaking }) => (
                                <Volume>
                                  <Meter
                                    buckets={16}
                                    volume={-volume}
                                    speaking={speaking}
                                    loaded={!!previewAudio.inputDetected}
                                    noInput={noInput}
                                    requesting={!!requestingMicrophoneCapture}
                                  />
                                  {previewAudio.inputDetected && noInput && (
                                    <Error>Media lost.</Error>
                                  )}
                                  {!previewAudio.inputDetected && noInput && (
                                    <Info>No input detected from your microphone.</Info>
                                  )}
                                </Volume>
                              )}
                            />
                          ) : (
                            <Volume>
                              <Meter
                                buckets={16}
                                volume={0}
                                speaking={false}
                                loaded={true}
                                noInput={false}
                                requesting={!!requestingMicrophoneCapture}
                              />
                            </Volume>
                          )}
                        </div>
                        }
                        <AcceptButtonContainer>
                          <button className="btn btn-default"
                            disabled={!this.state.showAccept || requestingCapture}
                            onClick={() => {
                              if (previewAudio) {
                                shareLocalMedia(previewAudio.id);
                              }
                              if (previewVideo) {
                                shareLocalMedia(previewVideo.id);
                              }

                              if (currentAudioDevice) {
                                localStorage.preferredAudioDeviceId = currentAudioDevice.deviceId;
                              }
                              if (currentVideoDevice) {
                                localStorage.preferredVideoDeviceId = currentVideoDevice.deviceId;
                              }

                              // Use this user-gesture to trigger empty audio elements to play, so we can
                              // later play sound effects.
                              // initSounds();

                              this.props.onAccept();
                            }}
                          >
                            {!this.state.showAccept || requestingCapture
                              ? 'Getting Ready...'
                              : 'Save Settings'}
                          </button>
                        </AcceptButtonContainer>
                      </>
                    );
                  }}
                />
              </Controls>
            </Container>
          );
        }}
      />
    );
  }

  private initialAutoCapture(
    microphonePermissionGranted: boolean,
    cameraPermissionGranted: boolean,
    requestingCapture?: boolean,
    audioModeType?: 'never' | 'sometimes' | 'always',
  ) {
    const auto =
      this.state.allowInitialAutoCapture &&
      (microphonePermissionGranted || cameraPermissionGranted) &&
      !requestingCapture &&
      !this.state.previewAudioId &&
      !this.state.previewVideoId;
    if (!auto) {
      return null;
    }

    setTimeout(() => {
      this.setState({
        allowInitialAutoCapture: false
      });
    }, 0);

    return (
      <RequestUserMedia
        share={false}
        auto={auto}
        audio={
          microphonePermissionGranted && audioModeType !== 'never'
            ? {
                deviceId: { ideal: localStorage.preferredAudioDeviceId }
              }
            : false
        }
        video={
          cameraPermissionGranted
            ? {
                deviceId: { ideal: localStorage.preferredVideoDeviceId }
              }
            : false
        }
        volumeMonitoring={deviceSupportsVolumeMonitoring()}
        replaceAudio={this.state.previewAudioId}
        replaceVideo={this.state.previewVideoId}
        onError={() => {
          this.setState({
            allowInitialAutoCapture: false
          });
        }}
        onSuccess={ids => {
          this.setState({
            allowInitialAutoCapture: false,
            previewAudioId: ids && ids.audio,
            previewVideoId: ids && ids.video
          });
        }}
        render={() => null}
      />
    );
  }

  private renderInputSelector(
    kind: 'audio' | 'video',
    hasDevice: boolean,
    permissionGranted: boolean,
    permissionDenied: boolean,
    requestingCapture: boolean,
    devices: MediaDeviceInfo[],
    currentDevice: MediaDeviceInfo | undefined,
    currentOtherDevice: MediaDeviceInfo | undefined,
    preview: Media,
    otherPreview: Media,
    removeMedia: (id: string) => void,
    noDevicesLabel: string,
    noPermissionLabel: string,
    capturingLabel: string,
    requestPermissionLabel: string,
    disableLabel: string
  ) {
    if (hasDevice === false) {
      return <Error>{noDevicesLabel}</Error>;
    }
    if (permissionDenied) {
      return <Error>{noPermissionLabel}</Error>;
    }
    if (requestingCapture) {
      return <Info>{capturingLabel}</Info>;
    }

    const constraints: MediaTrackConstraints = {
      [kind]: true,
      [kind === 'audio' ? 'video' : 'audio']: currentOtherDevice
        ? {
            deviceId: { exact: currentOtherDevice.deviceId }
          }
        : !!otherPreview
    };

    return (
      <RequestUserMedia
        share={false}
        {...constraints}
        replaceAudio={this.state.previewAudioId}
        replaceVideo={this.state.previewVideoId}
        volumeMonitoring={deviceSupportsVolumeMonitoring()}
        render={getMedia => {
          if (!preview && !permissionGranted) {
            return (
              <PermissionButton
                onClick={() => {
                  this.runGetMedia(getMedia);
                }}
              >
                <span>{requestPermissionLabel}</span>
              </PermissionButton>
            );
          } else {
            return (
              <select
                className="form-control"
                value={currentDevice ? currentDevice.deviceId : 'disable'}
                onChange={e => {
                  const deviceId = e.target.value;
                  if (!deviceId) {
                    return;
                  }

                  this.setState({ allowInitialAutoCapture: false });
                  if (deviceId !== 'disable') {
                    this.runGetMedia(getMedia, {
                      [kind]: {
                        deviceId: { exact: deviceId }
                      }
                    });
                  } else {
                    if (kind === 'audio') {
                      removeMedia(this.state.previewAudioId!);
                      this.setState({ previewAudioId: undefined });
                    } else {
                      removeMedia(this.state.previewVideoId!);
                      this.setState({ previewVideoId: undefined });
                    }
                  }
                  if (!e.target.value) {
                    return;
                  }
                }}
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
                <option key="disabled" value="disable">
                  {disableLabel}
                </option>
              </select>
            );
          }
        }}
      />
    );
  }

  private runGetMedia(getMedia: GetMedia, additional?: MediaStreamConstraints): void {
    this.setState({ allowInitialAutoCapture: false });
    getMedia(additional).then(ids => {
      this.setState({
        previewAudioId: ids && ids.audio,
        previewVideoId: ids && ids.video
      });
    });
  }
}

export default Haircheck;
