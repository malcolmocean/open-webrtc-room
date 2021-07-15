import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import mq from '../styles/media-queries';
import { colorToString } from '../utils/colorify';
import Roster from './Roster';
import SidebarUserControls from './SidebarUserControls';
import Haircheck from './Haircheck';

const UserBoxSelf = styled.div.attrs(props => ({
  className: 'reactroom-user-box reactroom-user-box-self',
}))({
  display: 'inline-block',
  width: '180px',
  height: '236px',
  // '& .reactroom-user-box-buttons': {
  //   display: 'none',
  // },
  // '&:hover .reactroom-user-box-buttons': {
  //   display: 'block',
  // }
})

interface Props {
  roomAddress: string;
  activeSpeakerView: boolean;
  // toggleActiveSpeakerView: () => void;
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
      // toggleActiveSpeakerView,
      pttMode,
      togglePttMode,
      roomId,
      allowShareScreen,
      allowWalkieTalkieMode,
    } = this.props;

    return (
      <UserBoxSelf>
      {this.state.inHaircheckMode ? (
        <Haircheck
          onAccept={() => {
            this.setState({ inHaircheckMode: false });
          }}
        /> ) : (
        <div className='reactroom-ownvideo'>
          <SidebarUserControls
            activeSpeakerView={activeSpeakerView}
            // toggleActiveSpeakerView={toggleActiveSpeakerView}
            pttMode={pttMode}
            togglePttMode={togglePttMode}
            allowShareScreen={allowShareScreen}
            allowWalkieTalkieMode={allowWalkieTalkieMode}
            chooseDevices={() => this.chooseDevices()}
          />
        </div>
        )}
      </UserBoxSelf>
    );
  }

  private chooseDevices() {
    this.setState({ inHaircheckMode: true });
  }
}
