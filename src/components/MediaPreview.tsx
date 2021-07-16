import { Media, Video } from '@andyet/simplewebrtc';
import React from 'react';
import styled from 'styled-components';
import mq from '../styles/media-queries';

const Container = styled.div({
  position: 'relative',
  // height: '180px',
  width: '180px',
  // padding: '0 10px',
  // [mq.SMALL_DESKTOP]: {
  //   padding: '0',
  //   width: '500px'
  // },
  '& video': {
    width: '100%',
    // height: '100%',
    objectFit: 'contain',
    backgroundColor: '#262a2c'
  }
});

const BlankVideo = styled.div({
  width: '180px',
  height: '135px',
  // backgroundColor: '#262a2c',
  // color: '#e9ecec',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& p': {
    margin: 0
  }
});

const LoadingVideo = () => (
  <BlankVideo>
    <span className='ffmo'>Loading video</span>
  </BlankVideo>
);

interface MediaPreviewProps {
  video?: Media;
}

// MediaPreview displays a camera feed if video is provided, and a VolumeMeter
// if audio is provided.
const MediaPreview: React.SFC<MediaPreviewProps> = ({ video }) => (
  <Container className='tintbg'>
    {video && video.loaded ? <Video media={video} /> : <LoadingVideo />}
  </Container>
);

export default MediaPreview;
