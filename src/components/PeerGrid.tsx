import { GridLayout, Peer, PeerList, RemoteMediaList } from '@andyet/simplewebrtc';
import React, { useContext } from 'react';
import styled from 'styled-components';
import HiddenPeers from '../contexts/HiddenPeers';
import Placeholders from '../contexts/Placeholders';
import PeerGridItem from './PeerGridItem';

const StyledGridLayout = styled(GridLayout)({
  flex: 1,
  // backgroundColor: '#eaecec',
  maxHeight: 'calc(var(--vh, 1vh) * 100)',
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  '& > div': {
    position: 'relative'
  }
}) as any; // TODO: Fix this!

interface Props {
  roomAddress: string;
  activeSpeakerView: boolean;
}

// PeerGrid is the main video display for Talky. It matches remoteMedia to
// peers and then renders a PeerGridItem for each peer in the room.
const PeerGrid: React.SFC<Props> = ({ roomAddress, activeSpeakerView }) => {
  const { hiddenPeers } = useContext(HiddenPeers);
  return (
    <PeerList
      speaking={activeSpeakerView ? activeSpeakerView : undefined}
      room={roomAddress}
      render={({ peers }) => {
        const visiblePeers = peers.filter(p => !hiddenPeers.includes(p.id));
        return <StyledGridLayout
          items={visiblePeers}
          renderCell={(peer: Peer) => (
            <RemoteMediaList
              peer={peer.address}
              render={({ media }) => (
                <PeerGridItem
                  media={media}
                  peer={peer}
                  onlyVisible={visiblePeers.length === 1}
                />
              )}
            />
          )}
        />
      }}
    />
  )
}

export default PeerGrid
