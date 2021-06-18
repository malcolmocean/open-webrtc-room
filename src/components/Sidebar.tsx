import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import mq from '../styles/media-queries';
import { colorToString } from '../utils/colorify';
import Roster from './Roster';
import SidebarUserControls from './SidebarUserControls';

// const Container = styled.div`
//   position: relative;
//   padding: 10px;
//   ${mq.MOBILE} {
//     position: absolute;
//     z-index: 200;
//     top: 0;
//     width: 185px;
//   }
//   ${mq.SMALL_DESKTOP} {
//     width: 220px;
//     border-right: ${({ theme }) => css`1px solid ${colorToString(theme.border)}`};
//   }
// `;

interface Props {
  roomAddress: string;
  activeSpeakerView: boolean;
  toggleActiveSpeakerView: () => void;
  pttMode: boolean;
  togglePttMode: (e: React.SyntheticEvent) => void;
  roomId: string;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
}

interface State {
  // showPasswordModal: boolean;
}

// Sidebar contains all the UI elements that are rendered in the Sidebar
// inside a Room.
// TODO: Use Router to navigate to feedback page.
export default class Sidebar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
    // this.state = { showPasswordModal: false };
  }

  public render() {
    const {
      roomAddress,
      activeSpeakerView,
      toggleActiveSpeakerView,
      pttMode,
      togglePttMode,
      roomId,
      allowShareScreen,
      allowWalkieTalkieMode,
    } = this.props;

    return (
      <div className='reactroom-ownvideo'>
        <SidebarUserControls
          activeSpeakerView={activeSpeakerView}
          toggleActiveSpeakerView={toggleActiveSpeakerView}
          pttMode={pttMode}
          togglePttMode={togglePttMode}
          allowShareScreen={allowShareScreen}
          allowWalkieTalkieMode={allowWalkieTalkieMode}
        />
      </div>
    );
  }
}
