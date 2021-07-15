import {Peer, PeerList, RemoteMediaList } from '@andyet/simplewebrtc';
import React from 'react';
import styled from 'styled-components';
import PeerGridItem from './PeerGridItem';
import Sidebar from '../components/Sidebar';

const StyledRowLayout = styled.div/*.attrs(props => ({
  className: 'reactroom-row-layout',
}))*/({
  flex: 1,
  lineHeight: 0,
  '& > div': {
    position: 'relative'
  }
})

interface Props {
  roomAddress: string;
  activeSpeakerView: boolean;
  pttMode: boolean;
  togglePttMode: (e: React.SyntheticEvent) => void;
  roomId: string;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  hasAnyMedia: boolean;
}

// export default class PeerRow extends Component<Props, State>
const PeerRow: React.SFC<Props> = ({
  roomAddress,
  activeSpeakerView,
  pttMode,
  togglePttMode,
  roomId,
  allowShareScreen,
  allowWalkieTalkieMode,
  hasAnyMedia,
}) => {
  return (
    <PeerList
      speaking={activeSpeakerView ? activeSpeakerView : undefined}
      room={roomAddress}
      render={({ peers }) => {
        return <StyledRowLayout>
          {hasAnyMedia ? <Sidebar
            roomAddress={roomAddress}
            activeSpeakerView={activeSpeakerView}
            // toggleActiveSpeakerView={this.toggleActiveSpeakerView}
            pttMode={pttMode}
            togglePttMode={togglePttMode}
            roomId={roomId}
            allowShareScreen={allowShareScreen}
            allowWalkieTalkieMode={allowWalkieTalkieMode}
          /> : null}
          {peers.map(peer => (
            <RemoteMediaList
              key={peer.id}
              peer={peer.address}
              render={({ media }) => (
                <PeerGridItem
                  media={media}
                  peer={peer}
                  onlyVisible={peers.length === 1}
                />
              )}
            />
          ))}
        </StyledRowLayout>
      }}
    />
  )
}

export default PeerRow
