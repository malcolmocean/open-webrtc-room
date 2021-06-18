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
  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  * {
    margin: 0;
    padding: 0;
  }

  body, html {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #4d5659;
  }

  a {
    background-color: transparent;
    text-decoration: none;
  }

  button:hover {
    cursor: pointer;
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
          <Container>
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

export default App;
