// this file no longer used
// the code was copied into LocalMediaControls for simplicity
import { RequestDisplayMedia } from '@andyet/simplewebrtc';
import ShareScreenIcon from 'material-icons-svg/components/baseline/ScreenShare';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { TalkyButton } from '../styles/button';
import mq from '../styles/media-queries';
import { deviceSupportsVolumeMonitoring } from '../utils/isMobile';
import { AudioModes } from '../contexts/AudioModes';

// not using this
const HideOnTinyScreensButton = styled(TalkyButton)({
  display: 'none',
  [mq.SMALL_DESKTOP]: {
    display: 'block'
  }
});

const EmptySpacer = styled.span({
  width: '120px'
});

// ScreenshareControls displays a button that activates the screenshare flow.
// It also provides a link to install the screenshare extension if it is
// required by the user's browser.
const ScreenshareControls: React.SFC = () => {
  const { audioModeType } = useContext(AudioModes);
  return <RequestDisplayMedia
    audio={audioModeType !== 'never'}
    volumeMonitoring={deviceSupportsVolumeMonitoring()}
    render={(getDisplayMedia, sharing) => {
      if (!sharing.available) {
        return <EmptySpacer />;
      }

      return (
        <TalkyButton title="Screen Share" onClick={getDisplayMedia}>
          <ShareScreenIcon fill="#505658" />
          <span>Share Screen</span>
        </TalkyButton>
      );
    }}
  />

};

export default ScreenshareControls;
