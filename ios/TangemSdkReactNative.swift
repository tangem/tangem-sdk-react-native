//  Copyright © 2021 Tangem. All rights reserved.

import Foundation
import CoreNFC
import TangemSdk


@available(iOS 13.0, *)
@objc(RNTangemSdk)
class RNTangemSdk: NSObject {
    private lazy var sdk: TangemSdk = {
        return TangemSdk()
    }()

    @objc func startSession(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(nil)
        }
    }

    @objc func stopSession(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(nil)
        }
    }

    @objc(readIssuerData:resolve:reject:) func readIssuerData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        sdk.readIssuerData(cardId: params?.getArg(.cardId),
                           initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                            self?.handleResult(result, resolve, reject)
        }
    }

    @objc(writeIssuerData:resolve:reject:) func writeIssuerData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let params = params
        guard let issuerData: Data = params?.getArg(.issuerData),
            let issuerDataSignature: Data = params?.getArg(.issuerDataSignature)  else {
                handleMissingArgs(reject)
                return
        }

        sdk.writeIssuerData(issuerData: issuerData,
                            issuerDataSignature: issuerDataSignature,
                            issuerDataCounter: params?.getArg(.issuerDataCounter),
                            cardId: params?.getArg(.cardId),
                            initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                                self?.handleResult(result, resolve, reject)
        }
    }

    @objc(readIssuerExtraData:resolve:reject:) func readIssuerExtraData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        sdk.readIssuerExtraData(cardId: params?.getArg(.pin1),
                                initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                                    self?.handleResult(result, resolve, reject)
        }
    }

    @objc(writeIssuerExtraData:resolve:reject:) func writeIssuerExtraData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let params = params
        guard let cardId: String = params?.getArg(.cardId),
            let issuerData: Data = params?.getArg(.issuerData),
            let startingSignature: Data = params?.getArg(.startingSignature),
            let finalizingSignature: Data = params?.getArg(.finalizingSignature) else {
                handleMissingArgs(reject)
                return
        }

        sdk.writeIssuerExtraData(issuerData: issuerData,
                                 startingSignature: startingSignature,
                                 finalizingSignature: finalizingSignature,
                                 issuerDataCounter: params?.getArg(.issuerDataCounter),
                                 cardId: cardId,
                                 initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                                    self?.handleResult(result, resolve, reject)
        }
    }

    @objc(readUserData:resolve:reject:) func readUserData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        sdk.readUserData(cardId: params?.getArg(.cardId),
                         initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                            self?.handleResult(result, resolve, reject)
        }
    }

    @objc(writeUserData:resolve:reject:) func writeUserData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let params = params
        guard let userData: Data = params?.getArg(.userData) else {
            handleMissingArgs(reject)
            return
        }

        sdk.writeUserData(userData: userData,
                          userCounter: params?.getArg(.userCounter),
                          cardId: params?.getArg(.cardId),
                          initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                            self?.handleResult(result, resolve, reject)
        }
    }

    @objc(writeUserProtectedData:resolve:reject:) func writeUserProtectedData(_ params: Dictionary<String, Any>? = nil, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let cardId: String = params?.getArg(.cardId),
            let userProtectedData: Data = params?.getArg(.userProtectedData) else {
                handleMissingArgs(reject)
                return
        }

        sdk.writeUserProtectedData(userProtectedData: userProtectedData,
                                   userProtectedCounter: params?.getArg(.userProtectedCounter),
                                   cardId: cardId,
                                   initialMessage: params?.getArg(.initialMessage)) {[weak self] result in
                                    self?.handleResult(result, resolve, reject)
        }
    }

    @objc func getNFCStatus(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            var isNFCAvailable: Bool {
                if NSClassFromString("NFCNDEFReaderSession") == nil { return false }
                return NFCNDEFReaderSession.readingAvailable
            }
            let resp: NSDictionary = [
                "support": isNFCAvailable,
                "enabled": isNFCAvailable,
            ]
            resolve(resp);
        }
    }

    private func getArg<T>(for key: ArgKey, from arguments: Any?) -> T? {
        if let value = (arguments as? NSDictionary)?[key.rawValue] {
            return value as? T
        }

        return nil
    }

    @objc(runJSONRPCRequest:resolve:reject:) func runJSONRPCRequest(_ args: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let infoDictionary = args as? Dictionary<String,Any>
        guard let request: String = getArg(for: .JSONRPCRequest, from: infoDictionary) else {
            handleMissingArgs(reject)
            return
        }
        let cardId: String? = getArg(for: .cardId, from: args)
        let initialMessage: String? = getArg(for: .initialMessage, from: args)

        sdk.startSession(with: request,
                         cardId: cardId,
                         initialMessage: initialMessage) { result in
            resolve(result)
        }
    }


    private func handleMissingArgs(_ reject: RCTPromiseRejectBlock) {
        let missingArgsError = PluginError(code: 9999, localizedDescription: "Some arguments are missing or wrong")
        reject("\(missingArgsError.code)", missingArgsError.localizedDescription, nil)
    }

    private func handleResult<TResult: JSONStringConvertible>(_ sdkResult: Result<TResult, TangemSdkError>, _ resolve: RCTPromiseResolveBlock, _ reject: RCTPromiseRejectBlock) {
        switch sdkResult {
        case .success(let response):
            guard let data = response.json.data(using: .utf8) else { resolve({}); break }
            let jsonObject = try? JSONSerialization.jsonObject(with: data, options: [])
            resolve(jsonObject)
        case .failure(let error):
            let pluginError = error.toPluginError()
            reject("\(pluginError.code)", pluginError.localizedDescription, nil)
        }
    }

    private func handleSignError(reject: RCTPromiseRejectBlock) {
        reject("9998", "Failed to sign data", nil)
    }
}
fileprivate struct PluginError: Encodable {
    let code: Int
    let localizedDescription: String

    var jsonDescription: String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys, .prettyPrinted]
        let data = (try? encoder.encode(self)) ?? Data()
        return String(data: data, encoding: .utf8)!
    }
}

fileprivate extension TangemSdkError {
    func toPluginError() -> PluginError {
        return PluginError(code: self.code, localizedDescription: self.localizedDescription)
    }
}

fileprivate enum ArgKey: String {
    case pin1
//    case pin2
    case cardId
//    case hashes
    case userCounter
    case userProtectedCounter
    case userData
    case issuerDataCounter
    case userProtectedData
    case issuerData
    case issuerDataSignature
    case startingSignature
    case finalizingSignature
//    case issuer
//    case manufacturer
//    case acquirer
//    case cardConfig
//    case pinCode
    case initialMessage
    case fileData
    case fileCounter
    case privateKey
    case readPrivateFiles
    case indices
    case JSONRPCRequest
}

fileprivate extension Dictionary where Key == String, Value == Any {
    func getArg<T: Decodable>(_ key: ArgKey) -> T? {
        if let value = self[key.rawValue] {
            if T.self == Data.self {
                if let hex = value as? String {
                    return Data(hexString: hex) as? T
                } else {
                    return nil
                }
            } else {
                if let decoded: T = decodeObject(value) {
                    return decoded
                } else {
                    return value as? T
                }
            }
        } else {
            return nil
        }
    }

    private func decodeObject<T: Decodable>(_ value: Any) -> T? {
        if let json = value as? String, let jsonData = json.data(using: .utf8) {
            do {
                return try JSONDecoder.tangemSdkDecoder.decode(T.self, from: jsonData)
            } catch {
                print(error)
                return nil
            }
        } else {
            if let array = value as? NSMutableArray,
               let jsonData = try? JSONSerialization.data(withJSONObject: array, options: []),
               let decoded = try? JSONDecoder.tangemSdkDecoder.decode(T.self, from: jsonData) {
                return decoded
            } else {
                return nil
            }
        }
    }
}


