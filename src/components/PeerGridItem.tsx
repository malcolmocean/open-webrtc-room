import { Media, Peer, PeerControls, Video, VolumeMeter } from '@andyet/simplewebrtc';
import FullScreenIcon from 'material-icons-svg/components/baseline/Fullscreen';
import ExitFullScreenIcon from 'material-icons-svg/components/baseline/FullscreenExit';
import ReportIcon from 'material-icons-svg/components/baseline/Report';
import VisibilityIcon from 'material-icons-svg/components/baseline/Visibility';
import VisibilityOffIcon from 'material-icons-svg/components/baseline/VisibilityOff';
import VolumeOffIcon from 'material-icons-svg/components/baseline/VolumeOff';
import VolumeUpIcon from 'material-icons-svg/components/baseline/VolumeUp';

import AccountBoxIcon from 'material-icons-svg/components/baseline/AccountBox';
import WebIcon from 'material-icons-svg/components/baseline/Web';

import React, { useContext } from 'react';
import styled from 'styled-components';
import HiddenPeers from '../contexts/HiddenPeers';
import { TalkyButton } from '../styles/button';
import FullScreen from './Fullscreen';
import { default as MyVolumeMeter } from './VolumeMeter';
import { AudioModes } from '../contexts/AudioModes';

import {
  Volume,
  ScreenVideo,
  OverlayButton,
  VisibilityButton,
  MuteButton,
  KickButton,
  FullScreenButton,
  DisplayName,
  VideoWrapper,
  VideoPlaceholder,
  ScreenWrapperSimple,
  UserBox,
  GridItemMedia,
  Overlay,
  RttContainer,
  MuteIndicator,
} from './GridItem';

function allAudioIsUnmuted(media: Media[]): boolean {
  for (const m of media) {
    if (m.kind === 'audio' && m.remoteDisabled) {
      return false;
    }
  }
  return true;
}

interface PeerGridItemOverlayProps {
  peer: Peer;
  audioIsMuted: boolean;
  fullScreenActive: boolean;
  toggleFullScreen: () => Promise<void>;
}

const PeerGridItemOverlay: React.SFC<PeerGridItemOverlayProps> = ({
  audioIsMuted,
  fullScreenActive,
  peer,
  toggleFullScreen,
}) => {
  const { audioMode, audioModeType } = useContext(AudioModes);
  const { hiddenPeers, togglePeer } = useContext(HiddenPeers);
  const isHidden = hiddenPeers.includes(peer.id)
  return (
    <Overlay>
      {peer.displayName && peer.displayName !== 'Anonymous' &&
        <div>
          <DisplayName>{peer.displayName}</DisplayName>
        </div>
      }
      <RttContainer>{peer.rtt && <span>{peer.rtt}</span>}</RttContainer>
      <MuteIndicator>
        {peer.muted || audioIsMuted ? (
          <VolumeOffIcon fill={peer.speaking ? 'red' : 'white'} />
        ) : null}
      </MuteIndicator>
      <PeerControls
        peer={peer}
        render={({ isMuted, mute, unmute, kick }) => (
          <div className='reactroom-user-box-buttons'>
            {/*
            <FullScreenButton
              onClick={toggleFullScreen}
              title={fullScreenActive ? 'Exit full screen' : `Show ${peer.displayName} full screen`}
            >
              {fullScreenActive ? (
                <ExitFullScreenIcon fill="white" />
              ) : (
                <FullScreenIcon fill="white" />
              )}
            </FullScreenButton>
            */}
              <VisibilityButton
                onClick={() => togglePeer(peer.id)}
                title={`${isHidden ? "Show" : "Hide"} video from ${peer.displayName}`}>
                {isHidden ? 
                  <VisibilityOffIcon fill="white" />
                  : <VisibilityIcon fill="white" />
                }
              </VisibilityButton>
            {/*
              : <VisibilityButton title={`Show video from ${peer.displayName}`}>
                <VisibilityIcon fill="white" onClick={() => togglePeer(peer.id)} />
              </VisibilityButton>
            */}
            {audioModeType == 'never' ? null :
              <MuteButton
                title={isMuted ? `Unmute ${peer.displayName}` : `Mute ${peer.displayName}`}
                onClick={() => (isMuted ? unmute() : mute())}
              >
                {isMuted ? (
                  <>
                    <VolumeOffIcon fill="white" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <VolumeUpIcon fill="white" />
                    <span>Mute</span>
                  </>
                )}
              </MuteButton>
            }
            {/*<KickButton
              title="Kick participant from the call"
              onClick={() => {
                kick();
                // setPassword(`${Math.floor(Math.random() * 10000)}`);
              }}
            >
              <ReportIcon fill="red" />
              <span>Kick</span>
            </KickButton>*/}
          </div>
        )}
      />
    </Overlay>
  );
};

interface PeerGridItemProps {
  peer: Peer;
  media: Media[];
  onlyVisible: boolean;
}

// PeerGridItem renders various controls over a peer's media
// currently not using onlyVisible
const PeerGridItem: React.SFC<PeerGridItemProps> = ({ peer, media, onlyVisible }) => {
  if (!media.length) {return <span />}
  return <>
    <UserBox>
      <PeerGridItemOverlay
        peer={peer}
        fullScreenActive={false}
        audioIsMuted={!allAudioIsUnmuted(media)}
        toggleFullScreen={async function () {}}
      />
      <GridItemMedia media={media} name={peer.displayName} peerId={peer.id} fullScreenActive={false} />
    </UserBox>
    {/* this colored box is just to simulate more users to see how wrapping etc works */}
    {/* they're also useful for getting an intuition for when react repaints */}
    {/*
    <UserBox>
      <div style={{height: (135+101)+'px', background: '#'+Math.floor(Math.random()*16777215).toString(16)}}></div>
    </UserBox>
    */}
  </>
};

export default PeerGridItem;
