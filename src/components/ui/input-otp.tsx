import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

type OtpInputFieldProps = {
  index: number;
  otpInputValue: string;
  isInputFocused: boolean;
  otpLength: number;
  otpFieldStyle?:
    | StyleProp<ViewStyle>
    | ((active?: boolean, error?: boolean) => StyleProp<ViewStyle>);
  otpTextStyle?: StyleProp<TextStyle>;
};

type OtpInputProps = Pick<
  OtpInputFieldProps,
  'otpLength' | 'otpFieldStyle' | 'otpTextStyle'
> & {
  title?: string;
  defaultValue?: string;
  onComplete?: (value: string) => void;
  errorMessage?: string;
  otpContainerStyle?: string;
};

export default function OtpInput({
  title,
  onComplete,
  defaultValue = '',
  otpLength = 4,
  errorMessage,
  otpFieldStyle,
  otpTextStyle,
  otpContainerStyle,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const [isOtpReady, setIsOtpReady] = useState<boolean>(false);
  const [otpInputValue, setOtpInputValue] = useState<string>(defaultValue);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const onFocusHandler = () => {
    setIsInputFocused(true);
    inputRef?.current?.focus();
  };

  const onChangeTextHandler = (text: string) => {
    setOtpInputValue(text);
    if (text.length === otpLength) {
      setIsOtpReady(true);
      onComplete && onComplete(text);
    } else {
      setIsOtpReady(false);
    }
  };

  useEffect(() => {
    if (defaultValue.length === otpLength) {
      onComplete && onComplete(otpInputValue);
    }
  }, []);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      inputRef?.current?.blur();
    });
    return () => {
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (otpInputValue.length === 0) {
      onFocusHandler();
    }
  }, [otpInputValue]);

  const getOtpFieldStyle = (
    active: boolean,
    error: boolean,
  ): StyleProp<ViewStyle> => {
    if (otpFieldStyle && typeof otpFieldStyle === 'function') {
      return otpFieldStyle(active, error);
    }
    if (otpFieldStyle) {
      return otpFieldStyle;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className={`flex flex-col gap-2 w-full ${otpContainerStyle}`}>
        <Text className={`text-base font-medium ${errorMessage ? 'text-red-500' : 'text-white'}`}>
          {title}
        </Text>
        <Pressable onPress={onFocusHandler} className="flex-row">
          {new Array(otpLength).fill(0).map((_value, index) => {
            const digit = otpInputValue[index] || '';
            const isCurrentDigit = index === otpInputValue.length;
            const isLastDigit = index === otpLength - 1;
            const isOtpInputFull = otpInputValue.length === otpLength;
            const isActive = isInputFocused && (isCurrentDigit || (isLastDigit && isOtpInputFull));

            return (
              <View
                key={index}
                style={getOtpFieldStyle(isActive, !!errorMessage)}
                className={`flex flex-col flex-1 gap-2 items-center justify-center ${
                  !otpFieldStyle && 'h-16 px-4 mr-2 border-2 rounded-lg bg-black-90'
                } ${!!errorMessage ? 'border-red-500' : isActive ? 'border-brand-green' : ''}`}
              >
                <Text
                  style={otpTextStyle}
                  className={`text-center text-lg font-bold dark:text-white`}
                >
                  {digit}
                </Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          style={[
            {
              position: 'absolute',
              left: 0,
              opacity: 0,
              zIndex: -1,
              color: 'transparent',
              textAlign: 'center',
            },
            getOtpFieldStyle(true, false),
          ]}
          value={otpInputValue}
          onChangeText={onChangeTextHandler}
          maxLength={otpLength}
          keyboardType="number-pad"
          defaultValue={defaultValue}
        />

        {errorMessage && <Text className="text-red-500 text-base font-medium">{errorMessage}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}