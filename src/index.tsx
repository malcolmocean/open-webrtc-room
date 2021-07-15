import * as SWRTC from '@andyet/simplewebrtc';
import { Actions, reducer, Selectors } from '@andyet/simplewebrtc';
import { VideoResolutionTier } from '@andyet/simplewebrtc/Definitions';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, compose as ReduxCompose, createStore } from 'redux';
import Thunk from 'redux-thunk';
import App from './App';
import { PlaceholderGenerator } from './types';

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

// Force the page to reload after 24 hours
// if (!localStorage.disablePageRefresh) {
//   setTimeout(() => {
//     window.location.reload(true);
//   }, 1000 * 60 * 60 * 24);
// } else {
//   console.log('Forced page refresh disabled');
// }
// if this should be happening, the outer container app (eg Complice)
// should be the one doing it -- and should detect idle state

interface RunConfig {
  root: HTMLElement;
  roomName: string;
  userName?: string;
  configUrl?: string;
  userData?: string;
  gridPlaceholder?: PlaceholderGenerator;
  haircheckHeaderPlaceholder?: PlaceholderGenerator;
  emptyRosterPlaceholder?: PlaceholderGenerator;
  homepagePlaceholder?: PlaceholderGenerator;
  openToPublic: boolean;
  allowShareScreen: boolean;
  allowWalkieTalkieMode: boolean;
  audioModeType: 'always' | 'sometimes' | 'never';
  audioOffMessage: string,
}

const run = ({
  roomName,
  userName,
  configUrl = '',
  userData = '',
  root,
  gridPlaceholder,
  haircheckHeaderPlaceholder,
  emptyRosterPlaceholder,
  homepagePlaceholder,
  openToPublic = true,
  allowShareScreen = true,
  allowWalkieTalkieMode = true,
  audioModeType = 'never',
  audioOffMessage = 'Audio is turned off sometimes in this room',
}: RunConfig) => {
  userName && setUserName(userName)
  setLowRes()
  ReactDOM.render(
    <Provider store={store}>
      <App
        roomName={roomName}
        configUrl={configUrl}
        userData={userData}
        roomConfig={{
          openToPublic,
          allowShareScreen,
          allowWalkieTalkieMode,
          audioModeType,
          audioOffMessage,
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

const dispatchAny = store.dispatch as any

function setUserName(name: string) {
  dispatchAny(Actions.setDisplayName(name))
}

function setLowRes() {
  console.log("~ ~ ~ setLowRes")
  // FYI: it counts everyone as a peer, not just people on video
  const tiers = [
    [1, {width: 180, height: 135, frameRate: 20 }],
    // [2, {width: 20, height: 15, frameRate: 10 }] // demo tiny
  ] as VideoResolutionTier[]
  dispatchAny(Actions.setVideoResolutionTiers(tiers))
}

function setHighRes() {
  console.log("~ ~ ~ setHighRes")
  const tiers = [
    [1, {width: 1920, height: 1080, frameRate: 60 }],
  ] as VideoResolutionTier[]
  dispatchAny(Actions.setVideoResolutionTiers(tiers))
}


export default {
  run,
  loadTemplate,
  setUserName,
  setHighRes,
  setLowRes,
};
