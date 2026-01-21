'use strict';

import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

import type { Message, TangemSdk } from './types';

const { RNTangemSdk } = NativeModules;

function getJsonRequest(method: SdkMethod = 'scan', params = {}) {
  return { jsonrpc: '2.0', id: '1', method, params };
}

function convertRequest(params: { [k: string]: any }): Object {
  Object.keys(params).forEach(function (key) {
    if (typeof params[key] === 'undefined') {
      delete params[key];
    }
    if (typeof params[key] === 'object') {
      params[key] = JSON.stringify(params[key]);
    }
  });
  return params;
}

function execCommand(
  method: SdkMethod = 'scan',
  params = {},
  cardId?: string,
  initialMessage?: Message
): Promise<any> {
  return execJsonRPCRequest(
    getJsonRequest(method, params),
    cardId,
    initialMessage
  );
}

async function execJsonRPCRequest(
  jsonRequest = {},
  cardId?: string,
  initialMessage?: Message,
  accessCode?: string
): Promise<any> {
  const request = {
    JSONRPCRequest: JSON.stringify(jsonRequest),
    cardId,
    initialMessage: JSON.stringify(initialMessage),
    accessCode,
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
  | 'sign_hash'
  | 'sign_hashes'
  | 'create_wallet'
  | 'purge_wallet'
  | 'import_wallet'
  | 'set_accesscode'
  | 'set_passcode'
  | 'reset_usercodes'
  | 'preflight_read'
  | 'change_file_settings'
  | 'delete_files'
  | 'read_files'
  | 'write_files'
  | 'set_usercode_recovery_allowed'
  | 'attest_card_key';

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
   * This method allows you to sign one hash.
   * Please note that Tangem cards usually protect the signing with a security delay
   * that may last up to 45 seconds, depending on a card.
   * It is for `SessionViewDelegate` to notify users of security delay.
   * Note: Wallet index works only on COS v.4.0 and higher. For previous version index will be ignored
   * @param {Data} hash Array of transaction hashes. It can be from one or up to ten hashes of the same length.
   * @param {Data} walletPublicKey Public key of wallet that should sign hashes.
   * @param {string} cardId Unique Tangem card ID number.
   * @param {string} [hdPath] Derivation path of the wallet. Optional. COS v. 4.28 and higher
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SignHashResponse>} response
   */
  signHash: (hash, walletPublicKey, cardId, hdPath, initialMessage) =>
    execCommand(
      'sign_hash',
      {
        walletPublicKey,
        hdPath,
        hash,
      },
      cardId,
      initialMessage
    ),

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
   * @returns {Promise<SignHashResponse>} response
   */
  signHashes: (hashes, walletPublicKey, cardId, hdPath, initialMessage) =>
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
   * This command will create a new wallet on the card having ‘Empty’ state.
   * A key pair WalletPublicKey / WalletPrivateKey is generated and securely stored in the card.
   * App will need to obtain Wallet_PublicKey from the response of `CreateWalletCommand` or `ReadCommand`
   * and then transform it into an address of corresponding blockchain wallet
   * according to a specific blockchain algorithm.
   * WalletPrivateKey is never revealed by the card and will be used by `SignCommand` and `CheckWalletCommand`.
   * RemainingSignature is set to MaxSignatures.
   * @param {EllipticCurve} curve Wallet's elliptic curve
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<CreateWalletResponse>}
   */
  createWallet: (curve, cardId, initialMessage) =>
    execCommand('create_wallet', { curve }, cardId, initialMessage),

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

  /** This command will import an esisting wallet
   *
   * @param {EllipticCurve} curve Elliptic curve of the wallet. `Card.supportedCurves` contains all curves supported by the card
   * @param {string} mnemonic BIP39 mnemonic to create wallet from. COS v.6.16+.
   * @param {string} passphrase BIP39 passphrase to create wallet from. COS v.6.16+. Empty passphrase by default.
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  importWalletMnemonic: (curve, mnemonic, passphrase, cardId, initialMessage) =>
    execCommand(
      'import_wallet',
      { curve, mnemonic, passphrase },
      cardId,
      initialMessage
    ),

  /** This command will import an esisting wallet
   *
   * @param {EllipticCurve} curve Elliptic curve of the wallet. `Card.supportedCurves` contains all curves supported by the card
   * @param {Data} seed BIP39 seed to create wallet from. COS v.6.16+.
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  importWalletSeed: (curve, seed, cardId, initialMessage) =>
    execCommand('import_wallet', { curve, seed }, cardId, initialMessage),

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
   * Reset all user codes
   * @param cardId
   * @param initialMessage
   */
  resetUserCodes: (cardId, initialMessage) =>
    execCommand('reset_usercodes', {}, cardId, initialMessage),

  /**
   * This command reads all files stored on card.
   * By default command trying to read all files (including private), to change this behaviour - setup your ` ReadFileDataTaskSetting `
   * - Note: When performing reading private files command, you must provide `pin2`
   * - Warning: Command available only for cards with COS 3.29 and higher
   *
   * @param {boolean} [readPrivateFiles] If true - all files saved on card will be read otherwise
   * @param {string} [fileName] File name
   * @param {Data} [walletPublicKey] Public key of wallet that should sign hashes.
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<ReadFilesResponse>}
   */
  readFiles: (
    readPrivateFiles,
    fileName,
    walletPublicKey,
    cardId,
    initialMessage
  ) =>
    execCommand(
      'read_files',
      { readPrivateFiles, fileName, walletPublicKey },
      cardId,
      initialMessage
    ),

  /**
   * This command write all files provided in `files` to card.
   *
   * Warning: This command available for COS 3.29 and higher
   * Note: Writing files protected by Pin2 only available for COS 3.34 and higher
   * @param {FileToWrite[]} files List of files that should be written to card
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
   * @param {number[]} [indices] Indexes of files that should be deleted. If nil - deletes all files from card
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  deleteFiles: (indices, cardId, initialMessage) =>
    execCommand('delete_files', { indices }, cardId, initialMessage),

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
   * @returns {Promise<SuccessResponse>}
   */
  changeFilesSettings: (changes, cardId, initialMessage) =>
    execCommand('change_file_settings', { changes }, cardId, initialMessage),

  /**
   * @param {string} cardId Unique Tangem card ID number.
   * @param {Data} fileData Data of file that will be saved on card
   * @param {number} fileCounter A counter that protect issuer data against replay attack.
   * @param {string} [fileName] File name
   * @param {Data} [privateKey] Optional private key that will be used for signing files hashes. If provided - resulting `FileHashData` will have signed file signatures
   *
   * @returns {Promise<PrepareHashesResponse>}
   */
  prepareHashes: (cardId, fileData, fileCounter, fileName, privateKey) =>
    RNTangemSdk.prepareHashes(
      convertRequest({
        cardId,
        fileData,
        fileCounter,
        fileName,
        privateKey,
      })
    ),

  attestCardKey: (challenge, cardId, initialMessage) =>
    execCommand('attest_card_key', { challenge }, cardId, initialMessage),

  /**
   * Set if card allowed to reset user code
   * @param {boolean} isAllowed This card can reset user codes on tte other linked card or not
   * @param {string} [cardId] Unique Tangem card ID number.
   * @param {Message} [initialMessage] A custom description that shows at the beginning of the NFC session. If nil, default message will be used
   *
   * @returns {Promise<SuccessResponse>}
   */
  setUserCodeRecoveryAllowed: (isAllowed, cardId, initialMessage) =>
    execCommand(
      'set_usercode_recovery_allowed',
      { isAllowed },
      cardId,
      initialMessage
    ),

  runJSONRPCRequest: (JSONRPCRequest, cardId, initialMessage, accessCode) =>
    execJsonRPCRequest(JSONRPCRequest, cardId, initialMessage, accessCode),

  startSession: () => RNTangemSdk.startSession(),
  stopSession: () => RNTangemSdk.stopSession(),
  getNFCStatus: () => RNTangemSdk.getNFCStatus(),

  /**
   * Listen for available events (Android)
   * @param  {string} eventName Name of event NFCStateChange
   * @param  {Function} handler Event handler
   */
  on: (eventName, handler) => {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(eventName, handler);
    }
  },

  /**
   * Stop listening for event (Android)
   * @param  {string} eventName Name of event NFCStateChange
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
