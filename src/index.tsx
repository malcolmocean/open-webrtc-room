import { Actions, reducer, Selectors } from '@andyet/simplewebrtc';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, compose as ReduxCompose, createStore } from 'redux';
import Thunk from 'redux-thunk';
import App from './App';
import { PlaceholderGenerator } from './types';
import getConfigFromMetaTag from './utils/metaConfig';
import randomRoomName from './utils/randomRoomName';
import Homepage from './screens/Homepage';

const configUrl = getConfigFromMetaTag('config-url');
const CONFIG_URL = configUrl ? configUrl : '';

const userData = getConfigFromMetaTag('user-data');
const USER_DATA = userData ? userData : '';

const compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || ReduxCompose;
const store = createStore(
  combineReducers({ simplewebrtc: reducer }),
  { simplewebrtc: {} as any },
  compose(applyMiddleware(Thunk))
);

(window as any).store = store;
(window as any).actions = Actions;
(window as any).selectors = Selectors;

// Fix vh units on mobile:
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);

// Force the page to reload after 3 hours
if (!localStorage.disablePageRefresh) {
  setTimeout(() => {
    window.location.reload(true);
  }, 1000 * 60 * 60 * 3);
} else {
  console.log('Forced page refresh disabled');
}

interface RunConfig {
  roomName: string;
  userName?: string;
  root: HTMLElement;
  gridPlaceholder?: PlaceholderGenerator;
  haircheckHeaderPlaceholder?: PlaceholderGenerator;
  emptyRosterPlaceholder?: PlaceholderGenerator;
  homepagePlaceholder?: PlaceholderGenerator;
  openToPublic: boolean;
  showHostVideo: boolean;
  showVisitorVideo: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
}

const run = ({
  roomName,
  userName,
  root,
  gridPlaceholder,
  haircheckHeaderPlaceholder,
  emptyRosterPlaceholder,
  homepagePlaceholder,
  openToPublic = true,
  showHostVideo = true,
  showVisitorVideo = true,
  allowShareScreen = true,
  allowWalkieTalkieMode = true,
}: RunConfig) => {
  if (CONFIG_URL.endsWith('YOUR_API_KEY')) {
    ReactDOM.render(
      <div className="container" style={{ textAlign: 'left' }}>
        Error: WebRTC unconfigured.
      </div>,
      root
    );
    return;
  }
  ReactDOM.render(
    <Provider store={store}>
      <App
        roomName={roomName}
        configUrl={CONFIG_URL}
        userData={USER_DATA}
        userName={userName}
        roomConfig={{
          openToPublic,
          showHostVideo,
          showVisitorVideo,
          allowShareScreen,
          allowWalkieTalkieMode,
        }}
      />
    </Provider>,
    root
  );
};

const loadTemplate = (id: string): DocumentFragment | null => {
  const el = document.getElementById(id);
  if (el !== null && el.nodeName === 'TEMPLATE') {
    return document.importNode((el as HTMLTemplateElement).content, true);
  }

  return null;
};

// not actually implemented properly probably
// function muteViaStore(mute: boolean) {
//   store.dispatch(mute ? Actions.muteSelf : Actions.unmuteSelf());
// }

export default {
  run,
  loadTemplate,
  randomRoomName,
  // muteViaStore,
};
