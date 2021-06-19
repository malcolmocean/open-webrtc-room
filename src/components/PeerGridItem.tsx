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

const Volume = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'middle'
});

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
  },
  marginLeft: '4px',
  marginBottom: '4px',
})

const VisibilityButton = styled(OverlayButton)({
});

const MuteButton = styled(OverlayButton)({
});

const KickButton = styled(OverlayButton)({
  marginLeft: '24px',
});

const FullScreenButton = styled(OverlayButton)({
  marginLeft: '16px',
});

const DisplayName = styled.span({
  display: 'inline-block',
  backgroundColor: '#323',
  opacity: 0.4,
  color: 'white',
  lineHeight: '24px',
  marginTop: '4px',
  marginLeft: '4px',
  fontSize: '16px',
  padding: '2px 7px 2px 7px',
  borderRadius: '5px',
  transition: 'opacity 200ms linear',
  '&:hover': {
    // cursor: 'pointer',
    opacity: 0.8
  }
});

interface PlaceholderProps {
  type: 'camera' | 'screen';
  name?: string;
  hidden?: boolean;
  // name?: string;
  // height: string;
  // bgcolor: string;
}

class VideoPlaceholder extends React.Component<PlaceholderProps> {
  constructor(props: PlaceholderProps) {
    super(props);
  }
  public render() {
    const {
      type,
      name,
      hidden,
      // height,
      // bgcolor,
      // children,
    } = this.props
    const height = type == 'camera' ? '135px' : '101px';
    // const bgcolor = '#eee9ee'
    const PlaceholderContainer = styled.div.attrs(props => ({
      className: 'tintbg',
    }))({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: height,
      color: '#323',
    })
    const PlaceholderName = styled.div({
      margin: '8px',
      fontSize: '16px',
      fontFamily: 'Montserrat, sans-serif',
      opacity: 0.4,
    })
    const PlaceholderIcon = styled.span({
      fontSize: '48px',
      opacity: 0.4,
      fill: '#323',
    })
    const HiddenSlash = styled.div({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'linear-gradient(135deg, #f001 49%,#c668 50%,#f001 51%)',
    })
    return <PlaceholderContainer>
      {hidden ? <HiddenSlash /> : null}
      <PlaceholderIcon>{
        type == 'camera' ? <AccountBoxIcon /> : <WebIcon />
      }</PlaceholderIcon>
    </PlaceholderContainer>
    // {name && false ? <PlaceholderName>{name}</PlaceholderName>: null}
  }
}

const UserBox = styled.div.attrs(props => ({
  className: 'reactroom-user-box',
}))({
  display: 'inline-block',
  width: '180px',
  '& .reactroom-user-box-buttons': {
    display: 'none',
  },
  '&:hover .reactroom-user-box-buttons': {
    display: 'block',
  }
})

interface PeerGridItemMediaProps {
  media: Media[];
  peer: Peer;
  fullScreenActive?: boolean;
}

// changed screenCapture quality profile from undefined to 'low'
// doesn't seem to work via localhost but MIGHT remotely (based on reading docs)
// there's a pretty strong bias to hi-res screenshare though
const PeerGridItemMedia: React.SFC<PeerGridItemMediaProps> = ({ media, peer, fullScreenActive }) => {
  const videoStreams = media.filter(m => m.kind === 'video' && !m.remoteDisabled);
  const webcamStreams = videoStreams.filter(s => !s.screenCapture);
  const screenCaptureStreams = videoStreams.filter(s => s.screenCapture);

  const { hiddenPeers } = useContext(HiddenPeers);

  if (hiddenPeers.includes(peer.id)) {
    return (
      <>
        <VideoPlaceholder type='camera' hidden={!!webcamStreams.length} name={peer.displayName} />
        <VideoPlaceholder type='screen' hidden={!!screenCaptureStreams.length} />
      </>
    );
  }

  if (videoStreams.length > 0) {
    if (webcamStreams.length && !screenCaptureStreams.length) {
      return (
        <>
          <Video media={webcamStreams[0]} qualityProfile='low' />
          <VideoPlaceholder type='screen' />
        </>
      );
    }

    if (screenCaptureStreams.length && !webcamStreams.length) {
      return (
        <>
          <VideoPlaceholder type='camera' name={peer.displayName} />
          <Video media={screenCaptureStreams[0]} qualityProfile='low' />
        </>
      );
    }

    return (
      <>
        <Video media={webcamStreams[0]} qualityProfile='low' />
        <Video media={screenCaptureStreams[0]} qualityProfile='low' />
      </>
    );
  }

  const DividerLine = styled.div({
    height: '1px',
    border: 'none',
    marginTop: 'none',
    marginBottom: 'none',
    background: '#cbc',
  })
  const audioStreams = media.filter(m => m.kind === 'audio' && !m.remoteDisabled);
  if (audioStreams.length) {
    console.log('audioStreams[0]', audioStreams[0])
    return (
      <>
        <VideoPlaceholder type='camera' name={peer.displayName} />
        <VolumeMeter
          media={audioStreams[0]}
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
                loaded={!!audioStreams[0].loaded}
                noInput={noInput}
                requesting={false}
              />
            </Volume>
          )}}
        />
        <DividerLine />
        <VideoPlaceholder type='screen' />
      </>
    )
    /* <AudioOnlyPeer /> is superceded by the above; file can probably be deleted */
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
      <PeerGridItemMedia media={media} peer={peer} fullScreenActive={false} />
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

// the old version, with fullscreen, which gets weird because of height:100%
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
