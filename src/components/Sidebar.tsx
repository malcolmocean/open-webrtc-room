import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import mq from '../styles/media-queries';
import { colorToString } from '../utils/colorify';
import Roster from './Roster';
import SidebarUserControls from './SidebarUserControls';
import Haircheck from './Haircheck';

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
  inHaircheckMode: boolean;
  // showPasswordModal: boolean;
}

export default class Sidebar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inHaircheckMode: false
    };
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
      <div>
      {this.state.inHaircheckMode ? (
        <Haircheck
          onAccept={() => {
            this.setState({ inHaircheckMode: false });
          }}
        /> ) : (
        <div className='reactroom-ownvideo'>
          <SidebarUserControls
            activeSpeakerView={activeSpeakerView}
            toggleActiveSpeakerView={toggleActiveSpeakerView}
            pttMode={pttMode}
            togglePttMode={togglePttMode}
            allowShareScreen={allowShareScreen}
            allowWalkieTalkieMode={allowWalkieTalkieMode}
            chooseDevices={() => this.chooseDevices()}
          />
        </div>
        )}
      </div>
    );
  }

  private chooseDevices() {
    this.setState({ inHaircheckMode: true });
  }
}
