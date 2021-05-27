/**
 * Stores and maps Tangem card settings
 */
export enum SettingsMask {
  IsReusable = 'IsReusable',
  UseActivation = 'UseActivation',
  ProhibitPurgeWallet = ' ProhibitPurgeWallet',
  UseBlock = 'UseBlock',
  AllowSetPIN1 = 'AllowSetPIN1',
  AllowSetPIN2 = 'AllowSetPIN2',
  UseCvc = 'UseCvc',
  ProhibitDefaultPIN1 = 'ProhibitDefaultPIN1',
  UseOneCommandAtTime = 'UseOneCommandAtTime',
  UseNDEF = 'UseNDEF',
  UseDynamicNDEF = 'UseDynamicNDEF',
  SmartSecurityDelay = 'SmartSecurityDelay',
  AllowUnencrypted = 'AllowUnencrypted',
  AllowFastEncryption = 'AllowFastEncryption',
  ProtectIssuerDataAgainstReplay = 'ProtectIssuerDataAgainstReplay',
  RestrictOverwriteIssuerExtraData = 'RestrictOverwriteIssuerExtraData',
  AllowSelectBlockchain = 'AllowSelectBlockchain',
  DisablePrecomputedNDEF = 'DisablePrecomputedNDEF',
  SkipSecurityDelayIfValidatedByLinkedTerminal = 'SkipSecurityDelayIfValidatedByLinkedTerminal',
  SkipCheckPIN2CVCIfValidatedByIssuer = 'SkipCheckPIN2CVCIfValidatedByIssuer',
  SkipSecurityDelayIfValidatedByIssuer = 'SkipSecurityDelayIfValidatedByIssuer',
  RequireTermTxSignature = 'RequireTermTxSignature',
  RequireTermCertSignature = 'RequireTermCertSignature',
  CheckPIN3OnCard = 'CheckPIN3OnCard',
}

/**
 * Status of the card.
 */
export enum CardStatus {
  NotPersonalized = 'notPersonalized',
  Empty = 'empty',
  Loaded = 'loaded',
  Purged = 'purged',
}

/**
 * Status of the wallet
 */
export enum WalletStatus {
  Empty = 'empty',
  Loaded = 'loaded',
  Purged = 'purged',
}

/**
 * Elliptic curve used for wallet key operations.
 */
export enum EllipticCurve {
  Secp256k1 = 'secp256k1',
  Ed25519 = 'ed25519',
  Secp256r1 = 'secp256r1',
}

export enum SigningMethod {
  SignHash = 'SignHash',
  SignRaw = 'SignRaw',
  SignHashSignedByIssuer = 'SignHashSignedByIssuer',
  SignRawSignedByIssuer = 'SignRawSignedByIssuer',
  SignHashSignedByIssuerAndUpdateIssuerData = 'SignHashSignedByIssuerAndUpdateIssuerData',
  SignRawSignedByIssuerAndUpdateIssuerData = 'SignRawSignedByIssuerAndUpdateIssuerData',
  SignPos = 'SignPos',
}

export enum ProductMask {
  Note = 'Note',
  Tag = 'Tag',
  IdCard = 'IdCard',
  IdIssuer = 'IdIssuer',
  TwinCard = 'TwinCard',
}

export enum VerificationState {
  Online = 'online',
  Offline = 'offline',
}

export enum SetPinStatus {
  PinsNotChanged = 'PinsNotChanged',
  Pin1Changed = 'Pin1Changed',
  Pin2Changed = 'Pin2Changed',
  Pin3Changed = 'Pin3Changed',
  Pins12Changed = 'Pins12Changed',
  Pins13Changed = 'Pins13Changed',
  Pins23Changed = 'Pins23Changed',
  Pins123Changed = 'Pins123Changed',
}

export enum FirmwareType {
  Sdk = 'd SDK',
  Release = 'r',
  Special = 'special',
}

export enum FileSettings {
  Private,
  Public,
}

export enum FileValidation {
  NotValidated = 'notValidated',
  Valid = 'valid',
  Corrupted = 'corrupted',
}

type Data = string;

export interface CardData {
  /**
   * Tangem internal manufacturing batch ID.
   */
  batchId?: string;
  /**
   * - DEPRECATED: Name of the blockchain.
   */
  blockchainName?: string;
  /**
   * Name of the issuer.
   */
  issuerName?: string;
  /**
   * Timestamp of manufacturing
   */
  manufactureDateTime?: Date;
  /**
   * Signature of CardId with manufacturer’s private key.
   */
  manufacturerSignature?: Data;
  /**
   * Mask of products enabled on card.
   */
  productMask?: ProductMask[];
  /**
   * Name of the token
   */
  tokenSymbol?: string;
  /**
   * Smart contract address.
   */
  tokenContractAddress?: string;
  /**
   * Number of decimals in token value.
   */
  tokenDecimal?: number;
}

/**
 * Holds information about card firmware version included version saved on card `version`,
 *  splitted to `major`, `minor` and `hotFix` and `FirmwareType`
 */
export interface FirmwareVersion {
  hotFix: number;
  major: number;
  minor: number;
  type: FirmwareType;
  version: string;
}
/**
 * Detailed information about card contents.
 */
export interface CardData {
  /**
   * Tangem internal manufacturing batch ID.
   */
  batchId?: string;
  /**
   * - DEPRECATED: Name of the blockchain.
   */
  blockchainName?: string;
  /**
   * Name of the issuer.
   */
  issuerName?: string;
  /**
   * Timestamp of manufacturing
   */
  manufactureDateTime?: Date;
  /**
   * Signature of CardId with manufacturer’s private key.
   */
  manufacturerSignature?: Data;
  /**
   * Mask of products enabled on card.
   */
  productMask?: ProductMask[];
  /**
   * Name of the token
   */
  tokenSymbol?: string;
  /**
   * Smart contract address.
   */
  tokenContractAddress?: string;
  /**
   * Number of decimals in token value.
   */
  tokenDecimal?: number;
}
export interface ArtworkInfo {
  id: string;
  hash: string;
  date: string;
}

export interface CardWallet {
  /**
   * Index of wallet in card storage. Use this index to create `WalletIndex` for interaction with wallet on card
   */
  index: number;
  /**
   * Current status of wallet
   */
  status: WalletStatus;
  /**
   * Explicit text name of the elliptic curve used for all wallet key operations.
   */
  curve?: EllipticCurve;
  /**
   * settingsMask
   */
  settingsMask?: SettingsMask;
  /**
   * Public key of the blockchain wallet.
   */
  publicKey?: Data;
  /**
   * Total number of signed single hashes returned by the card in `SignCommand`
   * responses since card personalization. Sums up array elements within all `SignCommand`.
   */
  signedHashes?: number;
  /**
   * Remaining number of `SignCommand` operations before the wallet will stop signing transactions.
   * This counter were deprecated for cards with COS 4.0 and higher
   */
  remainingSignatures?: number;
}

export interface Card {
  /**
   * Unique Tangem card ID number.
   */
  cardId?: string;
  /**
   * Name of Tangem card manufacturer.
   */
  manufacturerName?: string;
  /**
   * Current status of the card.
   */
  cardStatus?: CardStatus;
  /**
   * Version of Tangem COS.
   */
  firmwareVersion: FirmwareVersion;
  /**
   * Public key that is used to authenticate the card against manufacturer’s database.
   * It is generated one time during card manufacturing.
   */
  cardPublicKey?: Data;
  /**
   * Card settings defined by personalization (bit mask: 0 – Enabled, 1 – Disabled).
   */
  settingsMask?: SettingsMask[];
  /**
   * Public key that is used by the card issuer to sign IssuerData field.
   */
  issuerPublicKey?: Data;
  /**
   * Defines what data should be submitted to SIGN command.
   */
  signingMethods?: SigningMethod;
  /**
   * Delay in centiseconds before COS executes commands protected by PIN2. This is a security delay value
   */
  pauseBeforePin2?: number;
  /**
   * Any non-zero value indicates that the card experiences some hardware problems.
   * User should withdraw the value to other blockchain wallet as soon as possible.
   * Non-zero Health tag will also appear in responses of all other commands.
   */
  health?: number;
  /**
   * Whether the card requires issuer’s confirmation of activation
   */
  isActivated: boolean;
  /**
   * A random challenge generated by personalisation that should be signed and returned
   * to COS by the issuer to confirm the card has been activated. This field will not be returned if the card is activated
   */
  activationSeed?: Data;
  /**
   * Returned only if `SigningMethod.SignPos` enabling POS transactions is supported by card
   */
  paymentFlowVersion?: Data;
  /**
   * This value can be initialized by terminal and will be increased by COS on execution of every `SignCommand`.
   * For example, this field can store blockchain “nonce" for quick one-touch transaction on POS terminals.
   * Returned only if `SigningMethod.SignPos`  enabling POS transactions is supported by card.
   */
  userCounter?: number;
  /**
   * When this value is true, it means that the application is linked to the card,
   * and COS will not enforce security delay if `SignCommand` will be called
   * with `TlvTag.TerminalTransactionSignature` parameter containing a correct signature of raw data
   * to be signed made with `TlvTag.TerminalPublicKey`.
   */
  terminalIsLinked: boolean;
  /**
   * Detailed information about card contents. Format is defined by the card issuer.
   * Cards complaint with Tangem Wallet application should have TLV format.
   */
  cardData?: CardData;
  /**
   * Available only for cards with COS v.4.0 and higher.
   */
  pin2IsDefault?: boolean;
  /**
   * Maximum number of wallets that can be created for this card
   */
  walletsCount?: number;
  /**
   * Array of the wallets
   */
  wallets?: CardWallet[];
}

export type NFCStatusResponse = {
  enabled: boolean;
  support: boolean;
};

/**
 * Event's listeneres
 */
export type Events = 'NFCStateChange';
export type EventCallback = {
  enabled: boolean;
};

/**
 * Wrapper for a message that can be shown to user after a start of NFC session.
 */
export interface Message {
  /**
   * Body of message
   */
  body?: string;
  /**
   * Header of message
   */
  header?: string;
}

export interface VerifyResponse {
  artworkInfo?: ArtworkInfo;
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  cardPublicKey: Data;
  cardSignature: Data;
  salt: Data;
  verificationState?: VerificationState;
}

export interface ReadIssuerDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Data defined by user's App.
   */
  userData: Data;
  /**
   * Counter initialized by user's App and increased on every signing of new transaction
   */
  userProtectedData: Data;
  /**
   * Counter initialized by user's App and increased on every signing of new transaction
   */
  userCounter: number;
  /**
   * Counter initialized by user's App (confirmed by PIN2) and increased on every signing of new transaction
   */
  userProtectedCounter: number;
}

export interface WriteIssuerDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface WriteIssuerExtraDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface WriteUserDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface WriteUserProtectedDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface ReadIssuerExtraDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Size of all Issuer_Extra_Data field.
   */
  size?: number;
  /**
   * Data defined by issuer.
   */
  issuerData?: Data;
}

export interface ReadUserDataResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Data defined by user's App.
   */
  userData: Data;
  /**
   * Counter initialized by user's App and increased on every signing of new transaction
   */
  userProtectedData: Data;
  /**
   * Counter initialized by user's App and increased on every signing of new transaction
   */
  userCounter: number;
  /**
   * Counter initialized by user's App (confirmed by PIN2) and increased on every signing of new transaction
   */
  userProtectedCounter: number;
}
export interface CreateWalletResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Current status of the card [1 - Empty, 2 - Loaded, 3- Purged]
   */
  status: CardStatus;
  /**
   * Wallet index on card.
   * - Note: Available only for cards with COS v.4.0 and higher
   */
  walletIndex: number;
  /**
   * Public key of a newly created blockchain wallet.
   */
  walletPublicKey: Data;
}
export interface PurgeWalletResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Current status of the card [1 - Empty, 2 - Loaded, 3- Purged]
   */
  status: CardStatus;
  /**
   * Index of purged wallet
   */
  walletIndex: number;
}
export interface ChangePinResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * status
   */
  status: string;
}

/**
 * Config of Wallet
 */
export interface WalletConfig {
  isReusable?: boolean;
  prohibitPurgeWallet?: boolean;
  EllipticCurve?: EllipticCurve;
  signingMethods?: SigningMethod;
}

export interface FileSettingsChange {
  fileIndex: number;
  settings: FileSettings;
}

export interface File {
  fileIndex: number;
  fileData: Data;
  fileSettings?: FileSettings;
  fileValidationStatus: FileValidation;
}

export type ReadFilesResponse = {
  files: File[];
};

export interface WriteFilesResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  fileIndex?: number;
}

export interface DeleteFilesResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface ChangeFilesSettingsResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface TangemSdk {
  scanCard(initialMessage?: Message): Promise<Card>;

  sign(
    hashes: Data[],
    walletPublicKey: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<[Data]>;

  verify(
    online: boolean,
    cardId?: string,
    initialMessage?: Message
  ): Promise<VerifyResponse>;

  readIssuerData(
    cardId?: string,
    initialMessage?: Message
  ): Promise<ReadIssuerDataResponse>;

  writeIssuerData(
    issuerData: Data,
    issuerDataSignature: Data,
    issuerDataCounter?: number,
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteIssuerDataResponse>;

  readIssuerExtraData(
    cardId?: string,
    initialMessage?: Message
  ): Promise<ReadIssuerExtraDataResponse>;

  writeIssuerExtraData(
    issuerData: Data,
    startingSignature: Data,
    finalizingSignature: Data,
    issuerDataCounter?: number,
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteIssuerExtraDataResponse>;

  readUserData(
    cardId?: string,
    initialMessage?: Message
  ): Promise<ReadUserDataResponse>;

  writeUserData(
    userData: Data,
    userCounter: number,
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteUserDataResponse>;

  writeUserProtectedData(
    userProtectedData: Data,
    userProtectedCounter: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteUserProtectedDataResponse>;

  createWallet(
    config?: WalletConfig,
    cardId?: string,
    initialMessage?: Message
  ): Promise<CreateWalletResponse>;

  purgeWallet(
    walletPublicKey: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<PurgeWalletResponse>;

  changePin1(
    pin: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<ChangePinResponse>;

  changePin2(
    pin: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<ChangePinResponse>;

  readFiles(
    readPrivateFiles: boolean,
    indices?: number[],
    cardId?: string,
    initialMessage?: Message
  ): Promise<ReadFilesResponse>;

  writeFiles(
    files: File[],
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteFilesResponse>;

  deleteFiles(
    indicesToDelete?: number[],
    cardId?: string,
    initialMessage?: Message
  ): Promise<DeleteFilesResponse>;

  changeFilesSettings(
    changes: FileSettingsChange,
    cardId?: String,
    initialMessage?: Message
  ): Promise<ChangeFilesSettingsResponse>;

  startSession(): Promise<void>;
  stopSession(): Promise<void>;

  getNFCStatus(): Promise<NFCStatusResponse>;

  on(eventName: Events, handler: (state: EventCallback) => void): void;

  removeListener(
    eventName: Events,
    handler: (state: EventCallback) => void
  ): void;
}
