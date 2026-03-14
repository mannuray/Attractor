import 'styled-components';
import { ThemeColors } from './theme/themes';

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeColors {}
}
