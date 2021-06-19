import { Media, Peer, PeerControls, Video } from '@andyet/simplewebrtc';
import FullScreenIcon from 'material-icons-svg/components/baseline/Fullscreen';
import ExitFullScreenIcon from 'material-icons-svg/components/baseline/FullscreenExit';
import ReportIcon from 'material-icons-svg/components/baseline/Report';
import VisibilityIcon from 'material-icons-svg/components/baseline/Visibility';
import VolumeOffIcon from 'material-icons-svg/components/baseline/VolumeOff';
import VolumeUpIcon from 'material-icons-svg/components/baseline/VolumeUp';

import React, { useContext } from 'react';
import styled from 'styled-components';
import HiddenPeers from '../contexts/HiddenPeers';
import { TalkyButton } from '../styles/button';
import AudioOnlyPeer from './AudioOnlyPeer';
import FullScreen from './Fullscreen';

const OverlayButton = styled(TalkyButton)({
  display: 'inline-block',
  justifySelf: 'flex-end',
  opacity: 0.6,
  backgroundColor: 'black',
  color: 'white',
  transition: 'opacity 200ms linear',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: 'black',
    opacity: 0.8
  },
  '& svg': {
    fill: 'white'
  }
})

const MuteButton = styled(OverlayButton)({
  marginBottom: '16px',
  marginLeft: '4px',
});

const KickButton = styled(OverlayButton)({
  marginBottom: '16px',
  marginLeft: '24px',
});

const FullScreenButton = styled(OverlayButton)({
  marginBottom: '16px',
  marginLeft: '16px',
});

const VisibilityButton = styled(OverlayButton)({
  marginBottom: '16px',
  marginLeft: '4px',
});


const DisplayName = styled.span({
  display: 'inline-block',
  backgroundColor: 'black',
  opacity: 0.6,
  color: 'white',
  lineHeight: '24px',
  marginTop: '16px',
  marginLeft: '4px',
  fontSize: '16px',
  padding: '2px 7px 2px 7px',
  borderRadius: '5px',
  transition: 'opacity 200ms linear',
  '&:hover': {
    cursor: 'pointer',
    opacity: 0.8
  }
});

const UserBox = styled.div.attrs(props => ({
  className: 'reactroom-user-box',
}))({
  // border: '2px solid blue',
  display: 'inline-block',
  width: '180px',
  '& .reactroom-user-box-overlay': {
    display: 'none',
  },
  '&:hover .reactroom-user-box-overlay': {
    display: 'flex',
  }
})

interface PeerGridItemMediaProps {
  media: Media[];
  fullScreenActive?: boolean;
}

// changed screenCapture quality profile from undefined to 'low'
// doesn't seem to work via localhost but MIGHT remotely (based on reading docs)
// there's a pretty strong bias to hi-res screenshare though
const PeerGridItemMedia: React.SFC<PeerGridItemMediaProps> = ({ media, fullScreenActive }) => {
  const videoStreams = media.filter(m => m.kind === 'video' && !m.remoteDisabled);

  if (videoStreams.length > 0) {
    const webcamStreams = videoStreams.filter(s => !s.screenCapture);
    const screenCaptureStreams = videoStreams.filter(s => s.screenCapture);

    if (videoStreams.length === 1) {
      return (
        <Video
          media={videoStreams[0]}
          qualityProfile='low'
          // qualityProfile={fullScreenActive ? 'high' : 'medium'}
        />
      );
    }

    return (
      <>
        <Video media={webcamStreams[0]} qualityProfile='low' />
        <Video media={screenCaptureStreams[0]} qualityProfile='low' />
      </>
    );
  }

  const audioStreams = media.filter(m => m.kind === 'audio' && !m.remoteDisabled);
  if (audioStreams.length) {
    return <AudioOnlyPeer />
  }
  return <span />
};


const Overlay = styled.div.attrs(props => ({
  className: 'reactroom-user-box-overlay',
}))({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column'
});

const RttContainer = styled.div({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  '& span': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '18px'
  }
});

const MuteIndicator = styled.span({
  textAlign: 'center',
  fontSize: '48px',
  opacity: 0.8
});

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
  const { togglePeer } = useContext(HiddenPeers);
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
          <div>
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
            <VisibilityButton title={`Hide video from ${peer.displayName}`}>
              <VisibilityIcon fill="white" onClick={() => togglePeer(peer.id)} />
            </VisibilityButton>
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

// PeerGridItem renders various controls over a peer's media.
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
      <PeerGridItemMedia media={media} fullScreenActive={false} />
    </UserBox>
    {/* this colored box is just to simulate more users to see how wrapping etc works */}
    {/* they're also useful for getting an intuition for when react repaints */}
    <UserBox>
      <div style={{height: '150px', background: '#'+Math.floor(Math.random()*16777215).toString(16)}}></div>
    </UserBox>
  </>
};

// M: the fullscreen thing below is sort of a controller;
//    this is also the UI that's used when it's not fullscreen
// const PeerGridItem: React.SFC<PeerGridItemProps> = ({ peer, media, onlyVisible }) => {
//   if (!media.length) {return <span />}
//   return <FullScreen style={{ width: '100%', height: '100%' }}>
//     {({ fullScreenActive, toggleFullScreen }) => (
//       <UserBox>
//         <PeerGridItemOverlay
//           peer={peer}
//           fullScreenActive={fullScreenActive}
//           audioIsMuted={!allAudioIsUnmuted(media)}
//           toggleFullScreen={toggleFullScreen}
//         />
//         <PeerGridItemMedia media={media} fullScreenActive={fullScreenActive || onlyVisible} />
//       </UserBox>
//     )}
//   </FullScreen>
// };


export default PeerGridItem;
