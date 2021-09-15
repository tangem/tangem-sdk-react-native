'use strict';

import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

import type { Message, TangemSdk } from './types';

const { RNTangemSdk } = NativeModules;

function convertRequest(params: { [k: string]: any }): Object {
  Object.keys(params).forEach(function (key) {
    if (typeof params[key] === 'undefined') {
      delete params[key];
    }
    if (Platform.OS === 'ios' && typeof params[key] === 'object') {
      params[key] = JSON.stringify(params[key]);
    }
  });
  return params;
}

async function execCommand(
  method: SdkMethod = 'scan',
  params = {},
  cardId?: String,
  initialMessage?: Message
): Promise<any> {
  const request = {
    JSONRPCRequest: JSON.stringify({ jsonrpc: '2.0', id: '1', method, params }),
    cardId,
    initialMessage: JSON.stringify(initialMessage),
  };
  return new Promise(async (resolve, reject) => {
    try {
      const response = await RNTangemSdk.runJSONRPCRequest(request);
      const parseResponse =
        typeof response === 'object' ? response : JSON.parse(response);
      if (parseResponse.error) {
        reject(new Error(JSON.stringify(parseResponse.error, null, '\t')));
      }
      resolve(parseResponse.result);
    } catch (e) {
      reject(new Error('Could not complete the request'));
    }
  });
}

type SdkMethod =
  | 'scan'
  | 'sign_hashes'
  | 'create_wallet'
  | 'purge_wallet'
  | 'set_accesscode'
  | 'set_passcode'
  | 'preflight_read'
  | 'change_file_settings'
  | 'delete_files'
  | 'read_files'
  | 'write_files';

const tangemSdk: TangemSdk = {
  /**
   * To start using any card, you first need to read it using the `scanCard()` method.
   * This method launches an NFC session, and once it’s connected with the card,
   * it obtains the card data. optionally, if the card contains a wallet (private and public key pair),
   * it proves that the wallet owns a private key that corresponds to a public one.
   * @param {Message} initialMessage A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<Card>} response
   */
  scanCard: (initialMessage: Message) =>
    execCommand('scan', {}, undefined, initialMessage),

  /**
   * This method allows you to sign one or multiple hashes.
   * Simultaneous signing of array of hashes in a single `SignCommand` is required to support
   * Bitcoin-type multi-input blockchains (UTXO).
   * The `SignCommand` will return a corresponding array of signatures.
   * Please note that Tangem cards usually protect the signing with a security delay
   * that may last up to 45 seconds, depending on a card.
   * It is for `SessionViewDelegate` to notify users of security delay.
   * Note: Wallet index works only on COS v.4.0 and higher. For previous version index will be ignored
   * @param {Data[]} hashes Array of transaction hashes. It can be from one or up to ten hashes of the same length.
   * @param {Data} walletPublicKey Public key of wallet that should sign hashes.
   * @param {string} cardId Unique Tangem card ID number.
   * @param {string} [hdPath] Derivation path of the wallet. Optional. COS v. 4.28 and higher
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SignResponse>} response
   */
  sign: (hashes, walletPublicKey, cardId, hdPath, initialMessage) =>
    execCommand(
      'sign_hashes',
      {
        walletPublicKey,
        hdPath,
        hashes,
      },
      cardId,
      initialMessage
    ),

  /**
   * @deprecated Use files instead
   * This command return 512-byte Issuer Data field and its issuer’s signature.
   * Issuer Data is never changed or parsed from within the Tangem COS. The issuer defines purpose of use,
   * format and payload of Issuer Data. For example, this field may contain information about
   * wallet balance signed by the issuer or additional issuer’s attestation data.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ReadIssuerDataResponse>}
   */
  readIssuerData: (cardId, initialMessage) =>
    RNTangemSdk.readIssuerData(convertRequest({ cardId, initialMessage })),

  /**
   * @deprecated Use files instead
   *
   * This command writes some UserData, and UserCounter fields.
   * User_Data are never changed or parsed by the executable code the Tangem COS.
   * The App defines purpose of use, format and it's payload. For example, this field may contain cashed information
   * from blockchain to accelerate preparing new transaction.
   * User_Counter are counter, that initial value can be set by App and increased on every signing
   * of new transaction (on SIGN command that calculate new signatures). The App defines purpose of use.
   * For example, this fields may contain blockchain nonce value.
   * @param {Data} issuerData Data defined by user’s App
   * @param {Data} issuerDataSignature Issuer’s signature of `issuerData` with Issuer Data Private Key (which is kept on card).
   * @param {number} [issuerDataCounter] Counter initialized by user’s App and increased on every signing of new transaction.
   *  If nil, the current counter value will not be overwritten.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<WriteIssuerDataResponse>}
   */
  writeIssuerData: (
    issuerData,
    issuerDataSignature,
    issuerDataCounter,
    cardId,
    initialMessage
  ) =>
    RNTangemSdk.writeIssuerData(
      convertRequest({
        issuerData,
        issuerDataSignature,
        issuerDataCounter,
        cardId,
        initialMessage,
      })
    ),

  /**
   * @deprecated Use files instead
   *
   * This task retrieves Issuer Extra Data field and its issuer’s signature.
   * Issuer Extra Data is never changed or parsed from within the Tangem COS. The issuer defines purpose of use,
   * format and payload of Issuer Data. . For example, this field may contain photo or
   * biometric information for ID card product. Because of the large size of Issuer_Extra_Data,
   * a series of these commands have to be executed to read the entire Issuer_Extra_Data.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ReadIssuerExtraDataResponse>}
   */
  readIssuerExtraData: (cardId, initialMessage) =>
    RNTangemSdk.readIssuerExtraData({ cardId, initialMessage }),

  /**
   * @deprecated Use files instead
   *
   * This task writes Issuer Extra Data field and its issuer’s signature.
   * Issuer Extra Data is never changed or parsed from within the Tangem COS.
   * The issuer defines purpose of use, format and payload of Issuer Data.
   * For example, this field may contain a photo or biometric information for ID card products.
   * Because of the large size of Issuer_Extra_Data, a series of these commands have to be executed
   * to write entire Issuer_Extra_Data.
   * @param {Data} issuerData Data provided by issuer.
   * @param {Data} startingSignature Issuer’s signature with Issuer Data Private Key of `cardId`,
   * `issuerDataCounter` (if flags Protect_Issuer_Data_Against_Replay and
   * Restrict_Overwrite_Issuer_Extra_Data are set in `SettingsMask`) and size of `issuerData`.
   * @param {Data} finalizingSignature Issuer’s signature with Issuer Data Private Key of `cardId`,
   * `issuerData` and `issuerDataCounter` (the latter one only if flags Protect_Issuer_Data_Against_Replay
   * and Restrict_Overwrite_Issuer_Extra_Data are set in `SettingsMask`).
   * @param {number} [issuerDataCounter] An optional counter that protect issuer data against replay attack.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<WriteIssuerExtraDataResponse>}
   */
  writeIssuerExtraData: (
    issuerData,
    startingSignature,
    finalizingSignature,
    issuerDataCounter,
    cardId,
    initialMessage
  ) =>
    RNTangemSdk.writeIssuerExtraData(
      convertRequest({
        issuerData,
        startingSignature,
        finalizingSignature,
        issuerDataCounter,
        cardId,
        initialMessage,
      })
    ),

  /**
   * @deprecated Use files instead
   *
   * This command return two up to 512-byte User_Data, User_Protected_Data and two counters User_Counter and
   * User_Protected_Counter fields.
   * User_Data and User_ProtectedData are never changed or parsed by the executable code the Tangem COS.
   * The App defines purpose of use, format and it's payload. For example, this field may contain cashed information
   * from blockchain to accelerate preparing new transaction.
   * User_Counter and User_ProtectedCounter are counters, that initial values can be set by App and increased on every signing
   * of new transaction (on SIGN command that calculate new signatures). The App defines purpose of use.
   * For example, this fields may contain blockchain nonce value.
   *
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ReadUserDataResponse>}
   */
  readUserData: (cardId, initialMessage) =>
    RNTangemSdk.readUserData({ cardId, initialMessage }),

  /**
   * @deprecated Use files instead
   *
   * This command writes some UserData, and UserCounter fields.
   * User_Data are never changed or parsed by the executable code the Tangem COS.
   * The App defines purpose of use, format and it's payload. For example, this field may contain cashed information
   * from blockchain to accelerate preparing new transaction.
   * User_Counter are counter, that initial value can be set by App and increased on every signing
   * of new transaction (on SIGN command that calculate new signatures). The App defines purpose of use.
   * For example, this fields may contain blockchain nonce value.
   * Writing of UserCounter and UserData is protected only by PIN1.
   *
   * @param {Data} userData Data defined by user’s App
   * @param {number} userCounter: Counter initialized by user’s App and increased on every signing of new transaction.
   *  If nil, the current counter value will not be overwritten.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns Promise<WriteUserDataResponse>
   */
  writeUserData: (userData, userCounter, cardId, initialMessage) =>
    RNTangemSdk.writeUserData(
      convertRequest({ userData, userCounter, cardId, initialMessage })
    ),

  /**
   * @deprecated Use files instead
   *
   * This command writes some UserProtectedData and UserProtectedCounter fields.
   * User_ProtectedData are never changed or parsed by the executable code the Tangem COS.
   * The App defines purpose of use, format and it's payload. For example, this field may contain cashed information
   * from blockchain to accelerate preparing new transaction.
   * User_ProtectedCounter are counter, that initial value can be set by App and increased on every signing
   * of new transaction (on SIGN command that calculate new signatures). The App defines purpose of use.
   * For example, this fields may contain blockchain nonce value.
   *
   * UserProtectedCounter and UserProtectedData is protected by PIN1 and need additionally PIN2 to confirmation.
   *
   * @param {Data} userProtectedData Data defined by user’s App (confirmed by PIN2)
   * @param {number} userProtectedCounter Counter initialized by user’s App (confirmed by PIN2) and increased on every signing of new transaction.
   *  If nil, the current counter value will not be overwritten.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<WriteUserProtectedDataResponse>}
   */
  writeUserProtectedData: (
    userProtectedData,
    userProtectedCounter,
    cardId,
    initialMessage
  ) =>
    RNTangemSdk.writeUserData(
      convertRequest({
        userProtectedData,
        userProtectedCounter,
        cardId,
        initialMessage,
      })
    ),

  /**
   * This command will create a new wallet on the card having ‘Empty’ state.
   * A key pair WalletPublicKey / WalletPrivateKey is generated and securely stored in the card.
   * App will need to obtain Wallet_PublicKey from the response of `CreateWalletCommand` or `ReadCommand`
   * and then transform it into an address of corresponding blockchain wallet
   * according to a specific blockchain algorithm.
   * WalletPrivateKey is never revealed by the card and will be used by `SignCommand` and `CheckWalletCommand`.
   * RemainingSignature is set to MaxSignatures.
   * @param {EllipticCurve} curve Wallet's elliptic curve
   * @param {boolean} isPermanent: If this wallet can be deleted or not.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<CreateWalletResponse>}
   */
  createWallet: (curve, isPermanent, cardId, initialMessage) =>
    execCommand(
      'create_wallet',
      { curve, isPermanent },
      cardId,
      initialMessage
    ),

  /**
   * This command deletes all wallet data. If Is_Reusable flag is enabled during personalization,
   * the card changes state to ‘Empty’ and a new wallet can be created by `CREATE_WALLET` command.
   * If Is_Reusable flag is disabled, the card switches to ‘Purged’ state.
   * ‘Purged’ state is final, it makes the card useless.
   * - Note: Wallet index available for cards with COS v.4.0 or higher
   * @param {Data} walletPublicKey Public key of wallet that should be purged.
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  purgeWallet: (walletPublicKey, cardId, initialMessage) =>
    execCommand('purge_wallet', { walletPublicKey }, cardId, initialMessage),

  /**
   * Set or change card's access code
   * @param {string} accessCode Access code to set. If nil, the user will be prompted to enter code before operation
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  setAccessCode: (accessCode, cardId, initialMessage) =>
    execCommand('set_accesscode', { accessCode }, cardId, initialMessage),

  /**
   * Set or change card's passcode
   * @param {string} passcode: Passcode to set. If nil, the user will be prompted to enter code before operation
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  setPasscode: (passcode, cardId, initialMessage) =>
    execCommand('set_passcode', { passcode }, cardId, initialMessage),

  /**
   * This command reads all files stored on card.
   * By default command trying to read all files (including private), to change this behaviour - setup your ` ReadFileDataTaskSetting `
   * - Note: When performing reading private files command, you must provide `pin2`
   * - Warning: Command available only for cards with COS 3.29 and higher
   *
   * @param {boolean} readPrivateFiles If true - all files saved on card will be read otherwise
   * @param {number[]} [indices] Indices of files that should be read from card. If not specifies all files will be read.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ReadFilesResponse>}
   */
  readFiles: (readPrivateFiles, indices, cardId, initialMessage) =>
    execCommand(
      'read_files',
      { readPrivateFiles, indices },
      cardId,
      initialMessage
    ),

  /**
   * This command write all files provided in `files` to card.
   *
   * There are 2 main implementation of `DataToWrite` protocol:
   * - `FileDataProtectedBySignature` - for files signed by Issuer (specified on card during personalization)
   * - `FileDataProtectedByPasscode` - write files protected by Pin2
   *
   * Warning: This command available for COS 3.29 and higher
   * Note: Writing files protected by Pin2 only available for COS 3.34 and higher
   * @param {File[]} files List of files that should be written to card
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<WriteFilesResponse>}
   */
  writeFiles: (files, cardId, initialMessage) =>
    execCommand('write_files', { files }, cardId, initialMessage),

  /**
   * This command deletes selected files from card. This operation can't be undone.
   *
   * To perform file deletion you should initially read all files (`readFiles` command) and add them to `indices` array. When files deleted from card, other files change their indexes.
   * After deleting files you should additionally perform `readFiles` command to actualize files indexes
   * Warning: This command available for COS 3.29 and higher
   * @param {number[]} [indicesToDelete] Indexes of files that should be deleted. If nil - deletes all files from card
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<DeleteFilesResponse>}
   */
  deleteFiles: (indicesToDelete, cardId, initialMessage) =>
    execCommand('delete_files', { indicesToDelete }, cardId, initialMessage),

  /**
   * Updates selected file settings provided within `File`.
   *
   * To perform file settings update you should initially read all files (`readFiles` command), select files that you
   * want to update, change their settings in `File.fileSettings` and add them to `files` array.
   * Note: In COS 3.29 and higher only file visibility option (public or private) available to update
   * Warning: This method works with COS 3.29 and higher
   * @param {FileSettingsChange} changes Array of file indices with new settings
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ChangeFilesSettingsResponse>}
   */
  changeFilesSettings: (changes, cardId, initialMessage) =>
    execCommand('change_file_settings', { changes }, cardId, initialMessage),

  startSession: () => RNTangemSdk.startSession(),
  stopSession: () => RNTangemSdk.stopSession(),
  getNFCStatus: () => RNTangemSdk.getNFCStatus(),

  /**
   * Listen for available events (Android)
   * @param  {String} eventName Name of event NFCStateChange
   * @param  {Function} handler Event handler
   */
  on: (eventName, handler) => {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(eventName, handler);
    }
  },

  /**
   * Stop listening for event (Android)
   * @param  {String} eventName Name of event NFCStateChange
   * @param  {Function} handler Event handler
   */
  removeListener: (eventName, handler) => {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.removeListener(eventName, handler);
    }
  },
};

// export all types
export * from './types';

// export module
export default tangemSdk;
