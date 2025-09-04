import Toast from 'react-native-toast-message';

export function showSuccess(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
  });
}

export function showError(message: string) {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });
}