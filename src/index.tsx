import { NativeModules } from 'react-native';

type TangemSdkReactNativeNewType = {
  multiply(a: number, b: number): Promise<number>;
};

const { TangemSdkReactNativeNew } = NativeModules;

export default TangemSdkReactNativeNew as TangemSdkReactNativeNewType;
