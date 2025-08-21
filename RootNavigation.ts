import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[Name]
    ? [screen: Name] | [screen: Name, params: RootStackParamList[Name]]
    : [screen: Name, params: RootStackParamList[Name]]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...(args as any));
  }
}
