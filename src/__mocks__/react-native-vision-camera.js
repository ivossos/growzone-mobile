/**
 * Mock for react-native-vision-camera on Web platform
 * VisionCamera is not supported on Web, so we provide empty mocks
 */

export const Camera = () => null;

export const useCameraDevice = () => null;

export const useCameraFormat = () => null;

export const useCameraPermission = () => ({
  hasPermission: false,
  requestPermission: async () => ({ granted: false }),
});

export const useMicrophonePermission = () => ({
  hasPermission: false,
  requestPermission: async () => ({ granted: false }),
});

export default {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
};
