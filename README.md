<<<<<<< HEAD
# tangem-sdk-react-native-new

The Tangem card is a self-custodial hardware wallet for blockchain assets. The main functions of Tangem cards are to securely create and store a private key from a blockchain wallet and sign blockchain transactions. The Tangem card does not allow users to import/export, backup/restore private keys, thereby guaranteeing that the wallet is unique and unclonable.

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [iOS Notes](#ios-notes)
  - [Android Notes](#android-notes)
- [Usage](#usage)
  - [Scan card](#scan-card)
  - [Sign](#sign)
  - [Card attestation](#card-attestation)
    - [Card verification](#card-verification)
  - [NFC Status](#nfc-status)

## Getting Started

### Requirements

#### iOS

iOS 11+ (CoreNFC is required), Xcode 11+
SDK can be imported to iOS 11, but it will work only since iOS 13.

#### Android

Android with minimal SDK version of 21 and a device with NFC support

## Installation

```sh
npm install tangem-sdk-react-native-new
```

#### Android Notes

Add the following intent filters and metadata tag to your app `AndroidManifest.xml`

```xml
<intent-filter>
    <action android:name="android.nfc.action.NDEF_DISCOVERED"/>
    <category android:name="android.intent.category.DEFAULT"/>
</intent-filter>

<intent-filter>
    <action android:name="android.nfc.action.TECH_DISCOVERED"/>
</intent-filter>

<meta-data android:name="android.nfc.action.TECH_DISCOVERED" android:resource="@xml/nfc_tech_filter" />
```

Create the file `android/src/main/res/xml/nfc_tech_filter.xml` and add the following content:

```xml
<resources>
   <tech-list>
       <tech>android.nfc.tech.IsoDep</tech>
       <tech>android.nfc.tech.Ndef</tech>
       <tech>android.nfc.tech.NfcV</tech>
   </tech-list>
</resources>
```

<details>
  <summary>Example AndroidManifest.xml</summary>

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
         package="com.reactnativenfcdemo"
         android:versionCode="1"
         android:versionName="1.0">

   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
   <uses-permission android:name="android.permission.NFC" />

   <uses-sdk
           android:minSdkVersion="21"
           android:targetSdkVersion="22" />

   <application
           android:name=".MainApplication"
           android:allowBackup="true"
           android:label="@string/app_name"
           android:icon="@mipmap/ic_launcher"
           android:theme="@style/AppTheme">
       <activity
               android:name=".MainActivity"
               android:screenOrientation="portrait"
               android:label="@string/app_name"
               android:launchMode="singleTask"
               android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
               android:windowSoftInputMode="adjustResize">

           <intent-filter>
               <action android:name="android.intent.action.MAIN" />
               <category android:name="android.intent.category.LAUNCHER" />
           </intent-filter>

           <intent-filter>
               <action android:name="android.nfc.action.NDEF_DISCOVERED"/>
               <category android:name="android.intent.category.DEFAULT"/>
           </intent-filter>

           <intent-filter>
               <action android:name="android.nfc.action.TECH_DISCOVERED"/>
           </intent-filter>

           <meta-data android:name="android.nfc.action.TECH_DISCOVERED" android:resource="@xml/nfc_tech_filter" />

       </activity>
       <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
   </application>

</manifest>

```

</details>

#### iOS Notes

1. Add Swift Header Search Path to your app by following this steps:

- Open ios/YourAppName.xcodeproj in Xcode
- Right-click on Your App Name in the Project Navigator on the left, and click New File…
- Create a single empty Swift file to the project (make sure that Your App Name target is selected when adding)
- When Xcode asks, press Create Bridging Header and do not remove Swift file then.

2. As React Native trying to link against an older Swift runtime while targeting a newer version of the OS. We need to remove swift linking from our project to be able to compile the SDK. apply below changes on your IOS project file (`project.pbxproj`)

```diff
LIBRARY_SEARCH_PATHS = (
   "\"$(TOOLCHAIN_DIR)/usr/lib/swift/$(PLATFORM_NAME)\"",
-  "\"$(TOOLCHAIN_DIR)/usr/lib/swift-5.0/$(PLATFORM_NAME)\"",
   "\"$(inherited)\"",
 );
```

3. Configure your app to detect NFC tags. Turn on Near Field Communication Tag Reading under the Capabilities tab for the project’s target (see [Add a capability to a target](https://help.apple.com/xcode/mac/current/#/dev88ff319e7)).

4. Add the [NFCReaderUsageDescription](https://developer.apple.com/documentation/bundleresources/information_property_list/nfcreaderusagedescription) key as a string item to the Info.plist file. For the value, enter a string that describes the reason the app needs access to the device’s NFC reader:

```xml
<key>NFCReaderUsageDescription</key>
<string>Some reason</string>
```

5. In the Info.plist file, add the list of the application identifiers supported in your app to the [ISO7816 Select Identifiers](https://developer.apple.com/documentation/bundleresources/information_property_list/select-identifiers) (AIDs) information property list key. The AIDs of Tangem cards are: `A000000812010208` and `D2760000850101`.

```xml
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>A000000812010208</string>
    <string>D2760000850101</string>
</array>
```

6. To prevent customers from installing apps on a device that does not support the NFC capability, add the following to the Info.plist code (Optional):

```xml
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>nfc</string>
</array>
```

## Usage

Tangem SDK is a self-sufficient solution that implements a card abstraction model, methods of interaction with the card and interactions with the user via UI.

The easiest way to use the SDK is to call basic methods. The basic method performs one or more operations and, after that, calls completion block with success or error.

When calling basic methods, there is no need to show the error to the user, since it will be displayed on the NFC popup before it's hidden.

#### Start/Stop Session [Android]

Method `TangemSdk.startSession()` is needed before running any other method in android, calling this method will ask the user to enable the NFC in case of NFC disabled.

```js
TangemSdk.startSession();
```

> It's recommended to check for NFC status before running any other method and call this method again in case of disabled NFC

Method `TangemSdk.stopSession()` will stop NFC Manager and it's recommended to be called to stop the session.

```js
TangemSdk.stopSession();
```

#### Scan card

Method `tangemSdk.scanCard()` is needed to obtain information from the Tangem card. Optionally, if the card contains a wallet (private and public key pair), it proves that the wallet owns a private key that corresponds to a public one.

**Arguments:**

| Parameter      | Description                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| initialMessage | _(Optional)_ A custom description that shows at the beginning of the NFC session. If nil, default message will be used |

```js
import TangemSdk from 'tangem-sdk-react-native-new';

// ...

const initialMessage = { body: 'Body', header: 'Header' };
TangemSdk.scanCard(initialMessage)
  .then((response) => {
    // ...
  })
  .catch((error) => {
    // ...
  });
```

#### Sign

Method `tangemSdk.sign()` allows you to sign one or multiple hashes. The SIGN command will return a corresponding array of signatures.

**Arguments:**

| Parameter       | Description                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| hashes          | Array of hashes to be signed by card                                                                                   |
| walletPublicKey | Public key of wallet that should be purged.                                                                            |
| cardId          | _(Optional)_ If cardId is passed, the sign command will be performed only if the card                                  |
| initialMessage  | _(Optional)_ A custom description that shows at the beginning of the NFC session. If nil, default message will be used |

```js
import TangemSdk from 'tangem-sdk-react-native-new';

// ...

var hashes = [
  '44617461207573656420666f722068617368696e67',
  '4461746120666f7220757365642068617368696e67',
];
var walletPublicKey =
  '04C1E394BF9873331E296268290F79FF96DE3F97703C96AA7B2A7037AF6AB4FE0FB35E3DAD8FD4374C227A793105ED6617F289B0314B105CDDE20BF1F2A692E42B';
var cardId = 'CB41000000004271';
var initialMessage = { body: 'Body', header: 'Header' };

TangemSdk.sign(hashes, walletPublicKey, cardId, initialMessage)
  .then((response) => {
    // ...
  })
  .catch((error) => {
    // ...
  });
```

#### NFC Status

##### Get status

Method `TangemSdk.getNFCStatus()` will return current NFC Status which is supported on the device or is NFC enabled on the device.

```js
import TangemSdk from 'tangem-sdk-react-native-new';

// ...
TangemSdk.getNFCStatus();
```

##### Listen on events

with `TangemSdk.on()` and `TangemSdk.removeListener()` you should be able to add/remove listener on the certain events

Supported Events: `NFCStateChange`

```js
import TangemSdk from 'tangem-sdk-react-native-new';

// ...
TangemSdk.on('NFCStateChange', (enabled) => {
  console.log(enabled);
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
