import React from 'react';

// somehow enums
// const audioModeTypes = 'always' | 'sometimes' | 'never'

interface Context {
  audioModeType: 'always' | 'sometimes' | 'never';
  currentAudioState: 'on' | 'off';
  audioOffMessage: string;
  setAudioMode: (mode: 'on' | 'off') => void;
}

const AudioModes = React.createContext<Context>({
  audioModeType: 'never',
  currentAudioState: 'off',
  audioOffMessage: 'Audio is turned off sometimes in this room',
  setAudioMode: (mode: 'on' | 'off') => null
});

export {
  AudioModes,
  // audioModeTypes
};
