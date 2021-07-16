/* this component was just Room in original demo but this is ambiguous/confusing
with the Room from @andyet/simplewebrtc so changed to Vroom */
import {
  Actions,
  Connected,
  Connecting,
  Disconnected,
  Failed,
  Provider,
  RemoteAudioPlayer,
  LocalMediaList,
  RemoteMediaList,
  UserControls,
  Room
} from '@andyet/simplewebrtc';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PeerRow from '../components/PeerRow';
// import PeerGrid from '../components/PeerGrid';
// import Sidebar from '../components/Sidebar';
import Haircheck from '../components/Haircheck';
import LocalMediaControls from '../components/LocalMediaControls';
import HiddenPeers from '../contexts/HiddenPeers';
import { AudioModes } from '../contexts/AudioModes';
import ChooseDevices from '../contexts/ChooseDevices';
import mq from '../styles/media-queries';

const RootContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const Container = styled.div({
  flex: 1,
  display: 'flex',
  flexWrap: 'wrap',
  position: 'relative',
  flexDirection: 'column',
  [mq.SMALL_DESKTOP]: {
    flexDirection: 'row'
  }
});

const LoadingState = styled.div({
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 0%',
  justifyContent: 'center',
  position: 'relative'
});

const AudioOffBanner = styled.div({
  color: 'black',
  background: '#fe88',
  textAlign: 'center',
  padding: '5px',
  fontFamily: 'Montserrat, "Century Gothic", sans-serif',
  flex: '0 0 100%',
  height: 'auto',
})

const ClearFix = styled.div({
  clear: 'both'
})

interface RoomConfig {
  openToPublic: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  audioModeType: 'always' | 'sometimes' | 'never';
  audioOffMessage: string;
}

interface Props {
  configUrl: string;
  userData?: string;
  name: string;
  mute?: () => void;
  unmute?: () => void;
  roomConfig: RoomConfig;
}

interface State {
  activeSpeakerView: boolean;
  pttMode: boolean;
  sendRtt: boolean;
  hiddenPeers: string[];
  openToPublic: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  audioModeType: 'always' | 'sometimes' | 'never';
  audioMode: 'on' | 'off';
  audioOffMessage: string;
  showHaircheck: boolean;
}

class Index extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {
      openToPublic,
      allowShareScreen,
      allowWalkieTalkieMode,
      audioModeType,
      audioOffMessage,
    } = props.roomConfig;
    this.state = {
      activeSpeakerView: false,
      pttMode: false,
      sendRtt: false,
      hiddenPeers: [],
      audioModeType,
      audioOffMessage,
      audioMode: 'off',
      showHaircheck: false,
      openToPublic,
      allowShareScreen,
      allowWalkieTalkieMode,
    };
  }

  public render() {
    return (
      <Provider configUrl={this.props.configUrl} userData={this.props.userData}>
        <AudioModes.Provider
          value={{
            audioModeType: this.state.audioModeType,
            audioMode: this.state.audioMode,
            audioOffMessage: this.state.audioOffMessage,
            setAudioMode: this.setAudioMode
          }}
        >
          {this.state.audioMode == 'off' ? null :
            <RemoteAudioPlayer />
          }
          <HiddenPeers.Provider
            value={{
              hiddenPeers: this.state.hiddenPeers,
              togglePeer: this.togglePeer
            }}
          >
            <ChooseDevices.Provider
              value={{
                showHaircheck: this.state.showHaircheck,
                chooseDevices: this.chooseDevices,
              }}
            >
              <RootContainer>
                <Room name={this.props.name}>
                  {({ room }) => (<>
                    {this.state.showHaircheck ? <Haircheck
                      audioModeType={this.state.audioModeType}
                      audioMode={this.state.audioMode}
                      onAccept={() => {
                        this.setState({ showHaircheck: false });
                      }}
                    /> : null}
                    {/*<ClearFix />*/}
                    <Container>
                      <LocalMediaList
                        render={(localList) => (
                          <RemoteMediaList
                          render={(remoteList) => {
                            const allMedia = localList.media.concat(remoteList.media)
                            const allVideo = allMedia.filter(m => m.kind === 'video')
                            const allCameras = allMedia.filter(m => !m.screenCapture)
                            const allScreens = allMedia.filter(m => m.screenCapture)
                            // TODO = use this to style differently depending on what's visible
                            return <>
                              {allMedia.length ? <>
                                {this.state.audioModeType == 'never' ? null :
                                  (this.state.audioMode == 'off' ? <AudioOffBanner>
                                    {this.state.audioOffMessage}
                                  </AudioOffBanner> : null)
                                // removed from here so it could be part of PeerRow flow
                                // <Sidebar
                                //   roomAddress={room.address!}
                                //   activeSpeakerView={this.state.activeSpeakerView}
                                //   // toggleActiveSpeakerView={this.toggleActiveSpeakerView}
                                //   pttMode={this.state.pttMode}
                                //   togglePttMode={this.togglePttMode}
                                //   roomId={room.id!}
                                //   allowShareScreen={this.state.allowShareScreen}
                                //   allowWalkieTalkieMode={this.state.allowWalkieTalkieMode}
                                // />
                                }
                              </> : <LocalMediaControls
                                  isInline={true}
                                  hasAudio={false}
                                  hasVideo={false}
                                  hasScreenCapture={false}
                                  isMuted={true}
                                  unmute={() => {}}
                                  mute={() => {}}
                                  isPaused={true}
                                  resumeVideo={() => {}}
                                  pauseVideo={() => {}}
                                  isSpeaking={false}
                                  isSpeakingWhileMuted={false}
                                  allowShareScreen={this.state.allowShareScreen}
                                />
                              }
                              <Connected>
                                {room.joined ? (
                                  <PeerRow
                                    roomAddress={room.address!}
                                    activeSpeakerView={this.state.activeSpeakerView}
                                    pttMode={this.state.pttMode}
                                    togglePttMode={this.togglePttMode}
                                    roomId={room.id!}
                                    allowShareScreen={this.state.allowShareScreen}
                                    allowWalkieTalkieMode={this.state.allowWalkieTalkieMode}
                                    hasAnyMedia={Boolean(allMedia.length)}
                                    // hasAnyCameras={Boolean(allCameras.length)}
                                    // hasAnyScreens={Boolean(allScreens.length)}
                                  />
                                ) : room.roomFull ? (
                                  <LoadingState>
                                    <span className='reactroom-state reactroom-state-full'>This room is full.</span>
                                  </LoadingState>
                                ) : room.roomNotStarted ? (
                                  <LoadingState>
                                    <span className='reactroom-state reactroom-state-notstarted'>This room has not started yet.</span>
                                  </LoadingState>
                                ) : room.banned ? (
                                  <LoadingState>
                                    <span className='reactroom-state reactroom-state-notavailable'>This room is not available.</span>
                                  </LoadingState>
                                ) : (
                                  <LoadingState>
                                    <span className='reactroom-state reactroom-state-joining'>Joining room...</span>
                                  </LoadingState>
                                )}
                              </Connected>
                              <Connecting>
                                <LoadingState>
                                  <span className='reactroom-state reactroom-state-connecting'>Connecting...</span>
                                </LoadingState>
                              </Connecting>
                              <Disconnected>
                                <LoadingState>
                                  <span className='reactroom-state reactroom-state-lost'>Lost connection. Reattempting to join...</span>
                                </LoadingState>
                              </Disconnected>
                              <Failed>
                                <LoadingState>
                                  <span className='reactroom-state reactroom-state-failed'>Connection failed.</span>
                                </LoadingState>
                              </Failed>
                            </>
                          }}
                          />
                        )}
                      />
                    </Container>
                  </>)}
                </Room>
              </RootContainer>
            </ChooseDevices.Provider>
          </HiddenPeers.Provider>
        </AudioModes.Provider>
      </Provider>
    );
  }

  private toggleActiveSpeakerView = () => {
    this.setState({ activeSpeakerView: !this.state.activeSpeakerView });
  };

  private togglePttMode = (e: React.SyntheticEvent) => {
    this.setState({ pttMode: !this.state.pttMode }, () => {
      if (this.state.pttMode) {
        document.addEventListener('keydown', this.unmute);
        document.addEventListener('keyup', this.mute);
        window.addEventListener('blur', this.props.mute!);
        this.props.mute!();
      } else {
        document.removeEventListener('keydown', this.unmute);
        document.removeEventListener('keyup', this.mute);
        window.removeEventListener('blur', this.props.mute!);
        this.props.unmute!();
      }
    });

    if (e.target) {
      (e.target as HTMLElement).blur();
    }
  };

  private mute = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      this.props.mute!();
    }
  };

  private unmute = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      this.props.unmute!();
    }
  };

  private togglePeer = (peerId: string) => {
    if (this.state.hiddenPeers.includes(peerId)) {
      const hiddenPeers = [...this.state.hiddenPeers];
      const index = hiddenPeers.indexOf(peerId);
      hiddenPeers.splice(index);
      this.setState({ hiddenPeers });
    } else {
      this.setState({ hiddenPeers: [...this.state.hiddenPeers, peerId] });
    }
  };

  private setAudioMode = (mode: 'on' | 'off') => {
    this.setState({audioMode: mode})
  }

  private chooseDevices = (show: boolean) => {
    console.log('chooseDevices', show)
    this.setState({showHaircheck: show})
  }
}

function mapDispatchToProps(dispatch: any, props: Props): Props {
  return {
    ...props,
    mute: () => dispatch(Actions.muteSelf()),
    unmute: () => dispatch(Actions.unmuteSelf()),
  };
}

export default connect(null, mapDispatchToProps)(Index);
