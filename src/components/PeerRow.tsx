import {Peer, PeerList, RemoteMediaList } from '@andyet/simplewebrtc';
import React, { useContext } from 'react';
import styled from 'styled-components';
import HiddenPeers from '../contexts/HiddenPeers';
import Placeholders from '../contexts/Placeholders';
import PeerGridItem from './PeerGridItem';

const StyledRowLayout = styled.div.attrs(props => ({
  className: 'reactroom-row-layout',
}))({
  flex: 1,
  // backgroundColor: '#eaecec',
  // maxHeight: 'calc(var(--vh, 1vh) * 100)',
  // '& video': {
  //   width: '100%',
  //   height: '100%',
  //   objectFit: 'contain'
  // },
  '& > div': {
    position: 'relative'
  }
}) as any; // TODO: Fix this!

interface Props {
  roomAddress: string;
  activeSpeakerView: boolean;
}

const H2 = styled.h2`
  color: rgba(68, 68, 68, 0.25);
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`

// PeerGrid is the main video display for Talky. It matches remoteMedia to
// peers and then renders a PeerGridItem for each peer in the room.
const PeerRow: React.SFC<Props> = ({ roomAddress, activeSpeakerView }) => {
  const { hiddenPeers } = useContext(HiddenPeers);
  return (
    <PeerList
      speaking={activeSpeakerView ? activeSpeakerView : undefined}
      room={roomAddress}
      render={({ peers }) => {
        const visiblePeers = peers.filter(p => !hiddenPeers.includes(p.id));
        const EVENTUALLY = "instead of this, pass hiddenness down and display blank box in PeerGridItem"
        // oh! could maybe use disableMedia for this
        return <StyledRowLayout>
          {visiblePeers.map(peer => (
            <RemoteMediaList
              key={peer.id}
              peer={peer.address}
              render={({ media }) => (
                <PeerGridItem
                  media={media}
                  peer={peer}
                  onlyVisible={visiblePeers.length === 1}
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