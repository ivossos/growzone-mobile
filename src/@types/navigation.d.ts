import { DrawerNavigationOptions } from "@react-navigation/drawer"
import { SvgProps } from "react-native-svg";

interface CustomOptions extends DrawerNavigationOptions {
  title: string;
  iconName: React.ComponentType<SvgProps>;
  isDivider?: boolean
}