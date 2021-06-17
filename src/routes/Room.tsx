import {
  Actions,
  Connected,
  Connecting,
  Disconnected,
  Failed,
  Provider,
  RemoteAudioPlayer,
  RequestUserMedia,
  Room
} from '@andyet/simplewebrtc';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Haircheck from '../components/Haircheck';
import PeerGrid from '../components/PeerGrid';
import Sidebar from '../components/Sidebar';
import HiddenPeers from '../contexts/HiddenPeers';
import mq from '../styles/media-queries';

const RootContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const Container = styled.div({
  flex: 1,
  display: 'flex',
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

interface RoomConfig {
  openToPublic: boolean;
  showHostVideo: boolean;
  showVisitorVideo: boolean;
  allowInvites: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  allowChat: boolean;
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
  consentToJoin: boolean;
  pttMode: boolean;
  sendRtt: boolean;
  chatOpen: boolean;
  hiddenPeers: string[];
  openToPublic: boolean;
  showHostVideo: boolean;
  showVisitorVideo: boolean;
  allowInvites: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  allowChat: boolean;
}

class Index extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {
      openToPublic,
      showHostVideo,
      showVisitorVideo,
      allowInvites,
      allowShareScreen,
      allowWalkieTalkieMode,
      allowChat
    } = props.roomConfig;
    this.state = {
      activeSpeakerView: false,
      consentToJoin: true,
      pttMode: false,
      sendRtt: false,
      chatOpen: true,
      hiddenPeers: [],
      openToPublic,
      showHostVideo,
      showVisitorVideo,
      allowInvites,
      allowShareScreen,
      allowWalkieTalkieMode,
      allowChat
    };
  }

  public render() {
    return (
      <Provider configUrl={this.props.configUrl} userData={this.props.userData}>
        <RemoteAudioPlayer />
        <HiddenPeers.Provider
          value={{
            hiddenPeers: this.state.hiddenPeers,
            togglePeer: this.togglePeer
          }}
        >
          <RootContainer>
            <Room name={this.props.name}>
              {({ room }) => {
                return (
                  <Container>
                    <Sidebar
                      roomAddress={room.address!}
                      activeSpeakerView={this.state.activeSpeakerView}
                      toggleActiveSpeakerView={this.toggleActiveSpeakerView}
                      pttMode={this.state.pttMode}
                      togglePttMode={this.togglePttMode}
                      roomId={room.id!}
                      allowInvites={this.state.allowInvites}
                      allowShareScreen={this.state.allowShareScreen}
                      allowWalkieTalkieMode={this.state.allowWalkieTalkieMode}
                    />
                    <Connecting>
                      <LoadingState>
                        <h1>Connecting...</h1>
                      </LoadingState>
                    </Connecting>
                    <Disconnected>
                      <LoadingState>
                        <h1>Lost connection. Reattempting to join...</h1>
                      </LoadingState>
                    </Disconnected>
                    <Failed>
                      <LoadingState>
                        <h1>Connection failed.</h1>
                      </LoadingState>
                    </Failed>
                    <Connected>
                      {room.joined ? (
                        <PeerGrid
                          roomAddress={room.address!}
                          activeSpeakerView={this.state.activeSpeakerView}
                        />
                      ) : room.roomFull ? (
                        <LoadingState>
                          <h1>This room is full.</h1>
                        </LoadingState>
                      ) : room.roomNotStarted ? (
                        <LoadingState>
                          <h1>This room has not started yet.</h1>
                        </LoadingState>
                      ) : room.banned ? (
                        <LoadingState>
                          <h1>This room is not available.</h1>
                        </LoadingState>
                      ) : (
                        <LoadingState>
                          <h1>Joining room...</h1>
                        </LoadingState>
                      )}
                    </Connected>
                  </Container>
                );
              }}
            </Room>
          </RootContainer>
        </HiddenPeers.Provider>
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

  private toggleChat = () => {
    this.setState({ chatOpen: !this.state.chatOpen });
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
}

function mapDispatchToProps(dispatch: any, props: Props): Props {
  return {
    ...props,
    mute: () => dispatch(Actions.muteSelf()),
    unmute: () => dispatch(Actions.unmuteSelf())
  };
}

export default connect(null, mapDispatchToProps)(Index);
