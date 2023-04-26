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

export enum EncryptionMode {
  None = 'none',
  Fast = 'fast',
  Strong = 'strong',
}

export enum FirmwareType {
  Sdk = 'd SDK',
  Release = 'r',
  Special = 'special',
}

export enum FileVisibility {
  Private = 'private',
  Public = 'public',
}

export enum Status {
  Failed = 'failed',
  Warning = 'warning',
  Skipped = 'skipped',
  VerifiedOffline = 'verifiedOffline',
  Verified = 'verified',
}

export enum LinkedTerminalStatus {
  /**
   * Current app instance is linked to the card
   */
  Current = 'current',
  /**
   * The other app/device is linked to the card
   */
  Other = 'other',
  /**
   * No app/device is linked
   */
  None = 'none',
}

type Data = string;

type DerivationPath = string;

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

export interface WalletSettings {
  /**
   * if true, erasing the wallet will be prohibited
   */
  isPermanent: Boolean;
}

export interface Wallet {
  /**
   * Public key of the blockchain wallet.
   */
  publicKey: Data;
  /**
   * Optional chain code for BIP32 derivation.
   */
  chainCode?: Data;
  /**
   * Elliptic curve used for all wallet key operations.
   */
  curve: EllipticCurve;
  /**
   * Wallet's settings
   */
  settings: WalletSettings;
  /**
   * Total number of signed hashes returned by the wallet since its creation
   */
  totalSignedHashes?: number;
  /**
   * Remaining number of `Sign` operations before the wallet will stop signing any data.
   * - Note: This counter were deprecated for cards with COS 4.0 and higher
   */
  remainingSignatures?: number;
  /**
   * Index of the wallet in the card storage
   */
  index: Number;
}

export interface Manufacturer {
  /**
   * Card manufacturer name.
   */
  name: string;
  /**
   * Timestamp of manufacturing.
   */
  manufactureDate: Date;
  /**
   * Signature of CardId with manufacturer’s private key. COS 1.21+
   */
  signature?: Data;
}

export interface Issuer {
  /**
   * Name of the issuer.
   */
  name: string;
  /**
   * Public key that is used by the card issuer to sign IssuerData field.
   */
  publicKey: Data;
}

export interface Settings {
  /**
   * Delay in milliseconds before executing a command that affects any sensitive data or wallets on the card
   */
  securityDelay: number;
  /**
   * Maximum number of wallets that can be created for this card
   */
  maxWalletsCount: number;
  /**
   * Is allowed to change access code
   */
  isSettingAccessCodeAllowed: boolean;
  /**
   * Is  allowed to change passcode
   */
  isSettingPasscodeAllowed: boolean;
  /**
   * Is allowed to remove access code
   */
  isRemovingAccessCodeAllowed: boolean;
  /**
   * Is LinkedTerminal feature enabled
   */
  isLinkedTerminalEnabled: boolean;
  /**
   * All  encryption modes supported by the card
   */
  supportedEncryptionModes: [EncryptionMode];
  /**
   * Is allowed to delete wallet. COS before v4
   */
  isPermanentWallet: boolean;
  /**
   * Is overwriting issuer extra data restricted
   */
  isOverwritingIssuerExtraDataRestricted: boolean;
  /**
   * Card's default signing methods according personalization.
   */
  defaultSigningMethods?: SigningMethod;
  /**
   * Card's default curve according personalization.
   */
  defaultCurve?: EllipticCurve;
  /**
   *
   */
  isIssuerDataProtectedAgainstReplay: boolean;
  /**
   *
   */
  isSelectBlockchainAllowed: boolean;
}

export interface Attestation {
  /**
   * Attestation status of card's public key
   */
  cardKeyAttestation: Status;
  /**
   * Attestation status of all wallet public key in the card
   */
  walletKeysAttestation: Status;
  /**
   * Attestation status of card's firmware. Not implemented for this time
   */
  firmwareAttestation: Status;
  /**
   * Attestation status of card's uniqueness. Not implemented for this time
   */
  cardUniquenessAttestation: Status;
}

export interface Card {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Tangem internal manufacturing batch ID.
   */
  batchId: string;
  /**
   * Public key that is used to authenticate the card against manufacturer’s database.
   * It is generated one time during card manufacturing.
   */
  cardPublicKey: Data;
  /**
   * Version of Tangem COS.
   */
  firmwareVersion: FirmwareVersion;
  /**
   * Information about manufacturer
   */
  manufacturer: Manufacturer;
  /**
   * Information about issuer
   */
  issuer: Issuer;
  /**
   * Card setting, that were set during the personalization process
   */
  settings: Settings;
  /**
   * When this value is `current`, it means that the application is linked to the card,
   * and COS will not enforce security delay if `SignCommand` will be called
   * with `TlvTag.TerminalTransactionSignature` parameter containing a correct signature of raw data
   * to be signed made with `TlvTag.TerminalPublicKey`.
   */
  linkedTerminalStatus: LinkedTerminalStatus;
  /**
   * PIN2 (aka Passcode) is set.
   * Available only for cards with COS v.4.0 and higher.
   */
  isPasscodeSet?: boolean;
  /**
   * Array of ellipctic curves, supported by this card. Only wallets with these curves can be created.
   */
  supportedCurves: [EllipticCurve];
  /**
   * Wallets, created on the card, that can be used for signature
   */
  wallets?: Wallet[];
  /**
   * Card's attestation report
   */
  attestation: Attestation;
  /**
   * Any non-zero value indicates that the card experiences some hardware problems.
   * User should withdraw the value to other blockchain wallet as soon as possible.
   * Non-zero Health tag will also appear in responses of all other commands.
   */
  health?: number;
  /**
   * Remaining number of `SignCommand` operations before the wallet will stop signing transactions.
   * This counter were deprecated for cards with COS 4.0 and higher
   */
  remainingSignatures?: number;
  /**
   * Available only for cards with COS v.4.0 and higher.
   */
  isAccessCodeSet?: boolean;
}

export type NFCStatusResponse = {
  enabled: boolean;
  support: boolean;
};

/**
 * Event's listeners
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

export interface CreateWalletResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;

  /**
   * Created wallet
   */
  wallet: Wallet;
}

export interface SuccessResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
}

export interface SignHashResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Signed hash
   */
  signature: Data;
  /**
   * Total number of signed  hashes returned by the wallet since its creation. COS: 1.16+
   */
  totalSignedHashes?: number;
}

export interface SignHashesResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  /**
   * Signed hashes (array of resulting signatures)
   */
  signatures: Data[];
  /**
   * Total number of signed  hashes returned by the wallet since its creation. COS: 1.16+
   */
  totalSignedHashes?: number;
}

export interface FileSettings {
  isPermanent: boolean;
  visibility: FileVisibility;
}

export interface FileSettingsChange {
  [index: number]: FileVisibility;
}

export interface File {
  data: Data;
  index: number;
  settings: FileSettings;
}

export interface UserFile {
  /**
   * Data to write
   */
  data: Data;
  /**
   * Optional visibility setting for the file
   */
  fileVisibility?: FileVisibility;
  /**
   * Optional link to the card's wallet.
   */
  walletPublicKey?: Data;
}

export interface OwnerFile extends UserFile {
  /**
   * Starting signature of the file data
   */
  startingSignature?: Data;
  /**
   * Finalizing signature of the file data
   */
  finalizingSignature?: Data;
  /**
   * File name
   */
  fileName?: string;
  /**
   * File counter to prevent replay attack
   */
  counter?: number;
}

export type FileToWrite = OwnerFile | UserFile;

export type ReadFilesResponse = {
  files: File[];
};

export interface WriteFilesResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  filesIndices: number[];
}

export interface PrepareHashesResponse {
  startingHash: Data;
  finalizingHash: Data;
  startingSignature?: Data;
  finalizingSignature?: Data;
}

export interface AttestCardKeyResponse {
  /**
   * Unique Tangem card ID number.
   */
  cardId: string;
  salt: Data;
  cardSignature: Data;
  challenge: Data;
}

export interface TangemSdk {
  scanCard(initialMessage?: Message): Promise<Card>;

  signHash(
    hashes: Data,
    walletPublicKey: Data,
    cardId: string,
    hdPath?: DerivationPath,
    initialMessage?: Message
  ): Promise<[SignHashResponse]>;

  signHashes(
    hash: Data[],
    walletPublicKey: Data,
    cardId: string,
    hdPath?: DerivationPath,
    initialMessage?: Message
  ): Promise<[SignHashesResponse]>;

  createWallet(
    curve: EllipticCurve,
    cardId: string,
    initialMessage?: Message
  ): Promise<CreateWalletResponse>;

  purgeWallet(
    walletPublicKey: Data,
    cardId: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  importWalletSeed(
    curve: EllipticCurve,
    seed: Data,
    cardId: string,
    initialMessage?: Message
  ): Promise<CreateWalletResponse>;

  importWalletMnemonic(
    curve: EllipticCurve,
    mnemonic: string,
    passphrase: string,
    cardId: string,
    initialMessage?: Message
  ): Promise<CreateWalletResponse>;

  setAccessCode(
    accessCode: string,
    cardId: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  setPasscode(
    passcode: string,
    cardId: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  resetUserCodes(
    cardId: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  readFiles(
    readPrivateFiles?: boolean,
    fileName?: string,
    walletPublicKey?: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<ReadFilesResponse>;

  writeFiles(
    files: FileToWrite[],
    cardId?: string,
    initialMessage?: Message
  ): Promise<WriteFilesResponse>;

  deleteFiles(
    indices?: number[],
    cardId?: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  changeFilesSettings(
    changes: FileSettingsChange,
    cardId?: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  prepareHashes(
    cardId: string,
    fileData: Data,
    fileCounter: number,
    fileName?: string,
    privateKey?: Data
  ): Promise<PrepareHashesResponse>;

  attestCardKey(
    challenge: Data,
    cardId?: string,
    initialMessage?: Message
  ): Promise<AttestCardKeyResponse>;

  setUserCodeRecoveryAllowed(
    isAllowed: boolean,
    cardId: string,
    initialMessage?: Message
  ): Promise<SuccessResponse>;

  runJSONRPCRequest(
    JSONRPCRequest: object,
    cardId?: string,
    initialMessage?: Message,
    accessCode?: string
  ): Promise<any>;

  startSession(): Promise<void>;

  stopSession(): Promise<void>;

  getNFCStatus(): Promise<NFCStatusResponse>;

  on(eventName: Events, handler: (state: EventCallback) => void): void;

  removeListener(
    eventName: Events,
    handler: (state: EventCallback) => void
  ): void;
}
