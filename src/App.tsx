import React, { Component } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import ThemeProvider from './components/ThemeProvider';
import Placeholders from './contexts/Placeholders';
import Vroom from './routes/Vroom';
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
  #webrtcvideos_root video,
  #webrtcvideos_root .reactroom-ownvideo {
    width: 180px;
    max-height: 180px;
  }
`;

interface RoomConfig {
  openToPublic: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  audioModeType: 'always' | 'sometimes' | 'never';
  audioOffMessage: string;
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
          <Container>
            <Vroom
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

export default App;
