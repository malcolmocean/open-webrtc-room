import React, { Component } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import ThemeProvider from './components/ThemeProvider';
import Placeholders from './contexts/Placeholders';
import Room from './routes/Room';
import { PlaceholderGenerator } from './types';
import { colorToString, darken } from './utils/colorify';

const Container = styled.div`
  /* height: calc(var(--vh, 1vh) * 100);
  width: 100vw; */
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => colorToString(theme.background)};
  color: ${({ theme }) => colorToString(theme.foreground)};
  a {
    color: ${({ theme }) => colorToString(theme.primaryBackground)};
    :hover {
      color: ${({ theme }) => colorToString(darken(theme.primaryBackground, 0.1))};
    }
  }
`;

const GlobalStyle = createGlobalStyle`
  #webrtcvideos_root video {
    max-width: 200px;
    max-height: 200px;
  }
  #webrtcvideos_root .reactroom-ownvideo {
    width: 200px;
  }
`;

interface RoomConfig {
  openToPublic: boolean;
  showHostVideo: boolean;
  showVisitorVideo: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
}

interface Props {
  configUrl: string;
  userData?: string;
  userName?: string,
  roomName?: string;
  roomConfig: RoomConfig;
}

class App extends Component<Props> {
  public render() {
    const { roomName, configUrl, userName, userData, roomConfig } = this.props;
    return (
      <ThemeProvider>
        <div style={{ height: '100%' }}>
          <GlobalStyle />
          <Container id='webrtcvideos_root'>
            <Room
              name={roomName ? roomName : 'Default Room'}
              configUrl={configUrl}
              userData={userData}
              roomConfig={roomConfig}
            />
          </Container>
        </div>
      </ThemeProvider>

    );
  }
}
        // <style>
        //   ""
        // </style>

export default App;
