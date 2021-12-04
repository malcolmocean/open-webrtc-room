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

// stuff in common between PeerGridItem and SelfGridItem

const Volume = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'middle'
});

const ScreenVideo = styled(Video)({
  marginBottom: '-26.5px',
})

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

interface WrapperProps {
  type: 'camera' | 'screen';
  media: any;
  qualityProfile?: 'low' | 'high';
}

class VideoWrapper1 extends React.Component<WrapperProps> {
  constructor(props: WrapperProps) {
    super(props);
  }
  public render() {
    const height = this.props.type == 'camera' ? '135px' : '101px';
    const qualityProfile = this.props.qualityProfile || 'low'
    const Wrapper = styled.div({
      '& video': {
        height: height
      }
    })
    return <Wrapper><Video media={this.props.media} qualityProfile={qualityProfile} /></Wrapper>
  }
}
// this VideoWrapper component (either version) fixes the vertical offset bug
// (I THINK!)
// but triggers infinite loop of updates for some reason ¯\_(ツ)_/¯

const VideoWrapper: React.SFC<WrapperProps> = (props) => {
  const height = props.type == 'camera' ? '135px' : '101px';
  const qualityProfile = props.qualityProfile || 'low'
  const Wrapper = styled.div({
    '& video': {
      height: height
    }
  })
  return <Wrapper><Video media={props.media} qualityProfile={qualityProfile} /></Wrapper>
}

const ScreenWrapperSimple = styled.div({
  height: '101px',
  '& video': {
    height: '101px',
    marginBottom: '-27px',
  }
})

const UserBox = styled.div.attrs(props => ({
  className: 'reactroom-user-box',
}))({
  display: 'inline-block',
  width: '180px',
  height: '236px',
  '& .reactroom-user-box-buttons': {
    display: 'none',
  },
  '&:hover .reactroom-user-box-buttons': {
    display: 'block',
  }
})

interface GridItemMediaProps {
  media: Media[];
  name: string;
  peerId: string;
  fullScreenActive?: boolean;
}

// doesn't seem to work yet
// const AudioPlaceholder = styled.div({
//   height: '6px',
//   marginTop: 'none',
//   marginBottom: 'none',
// })

const DividerLine = styled.div({
  height: '1px',
  border: 'none',
  marginTop: 'none',
  marginBottom: 'none',
  background: '#cbc',
})

// changed screenCapture quality profile from undefined to 'low'
// doesn't seem to work via localhost but MIGHT remotely (based on reading docs)
// there's a pretty strong bias to hi-res screenshare though
const GridItemMedia: React.SFC<GridItemMediaProps> = ({ media, name, peerId, fullScreenActive }) => {
  const videoStreams = media.filter(m => m.kind === 'video' && !m.remoteDisabled);
  const webcamStreams = videoStreams.filter(s => !s.screenCapture);
  const screenStreams = videoStreams.filter(s => s.screenCapture);
  const audioStreams = media.filter(m => m.kind === 'audio' && !m.remoteDisabled);

  const { hiddenPeers } = useContext(HiddenPeers);

  // TODO: add an audio placeholder for good grid flow
  // but it'll need to be invisible in never-audio rooms
  const audio = !audioStreams.length ? <></> : <>
    <VolumeMeter
      media={audioStreams[0]}
      noInputTimeout={7000}
      render={({ noInput, volume, speaking }) => {
        // console.log('noInput', noInput)
        // console.log('volume', volume)
        // console.log('speaking', speaking)
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
  </>

  if (hiddenPeers.includes(peerId)) {
    return (
      <>
        <VideoPlaceholder type='camera' hidden={!!webcamStreams.length} name={name} />
        {audio}
        <VideoPlaceholder type='screen' hidden={!!screenStreams.length} />
      </>
    );
  }

  const webcam = webcamStreams.length ?
    <Video media={webcamStreams[0]} qualityProfile='low' />
    :
    <VideoPlaceholder type='camera' name={name} />

  const screen = screenStreams.length ?
    <ScreenWrapperSimple>
      <Video media={screenStreams[0]} qualityProfile='low' />
    </ScreenWrapperSimple>
    :
    <VideoPlaceholder type='screen' />

  return <>
    {webcam}
    {audio}
    {screen}
  </>
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

// the old PeerGridItem, with fullscreen, which gets weird because of height:100%
// M: the fullscreen thing below is sort of a controller;
//    this is also the UI that's used when it's not fullscreen
// const GridItem: React.SFC<GridItemProps> = ({ peer, media, onlyVisible }) => {
//   if (!media.length) {return <span />}
//   return <FullScreen style={{ width: '100%', height: '100%' }}>
//     {({ fullScreenActive, toggleFullScreen }) => (
//       <UserBox>
//         <GridItemOverlay
//           peer={peer}
//           fullScreenActive={fullScreenActive}
//           audioIsMuted={!allAudioIsUnmuted(media)}
//           toggleFullScreen={toggleFullScreen}
//         />
//         <GridItemMedia media={media} fullScreenActive={fullScreenActive || onlyVisible} />
//       </UserBox>
//     )}
//   </FullScreen>
// };

export {
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
  // GridItemOverlay,
};
