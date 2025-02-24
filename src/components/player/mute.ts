let muteState = false;
const subscribers: Function[] = [];

export const setGlobalMute = (
  newState: boolean | ((prevState: boolean) => boolean)
) => {
  if (typeof newState === "function") {
    muteState = newState(muteState);
  } else {
    muteState = newState;
  }

  subscribers.forEach((callback) => callback(muteState));
};

export const getGlobalMute = () => muteState;

export const subscribeToMuteState = (callback: Function) => {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) subscribers.splice(index, 1);
  };
};
