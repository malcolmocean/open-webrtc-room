import {Peer, PeerList, RemoteMediaList } from '@andyet/simplewebrtc';
import React from 'react';
import styled from 'styled-components';
import PeerGridItem from './PeerGridItem';

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
}

const PeerRow: React.SFC<Props> = ({ roomAddress, activeSpeakerView }) => {
  return (
    <PeerList
      speaking={activeSpeakerView ? activeSpeakerView : undefined}
      room={roomAddress}
      render={({ peers }) => {
        return <StyledRowLayout>
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
