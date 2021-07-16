import React from 'react';

interface Context {
  showHaircheck: boolean;
  chooseDevices: (show: boolean) => void;
}

const ChooseDevices = React.createContext<Context>({
  showHaircheck: false,
  chooseDevices: show => null,
});

export default ChooseDevices;
