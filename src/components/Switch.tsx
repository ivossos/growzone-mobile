import { Switch as NativeSwitch, useColorScheme } from 'react-native';

import { theme } from '@/styles/theme';
import { colors } from '@/styles/colors';

function Switch({
  ...props
}: React.ComponentPropsWithoutRef<typeof NativeSwitch>) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  const trackColor = props.trackColor || {
    false: colors.black[80], 
    true: colors.primary, 
  };
  const thumbColor = props.thumbColor;
  const ios_backgroundColor =
    props.ios_backgroundColor || colors.black[80] 

  return (
    <NativeSwitch
      trackColor={trackColor}
      thumbColor={thumbColor}
      ios_backgroundColor={ios_backgroundColor}
      {...props}

    />
  );
}

export { Switch };
