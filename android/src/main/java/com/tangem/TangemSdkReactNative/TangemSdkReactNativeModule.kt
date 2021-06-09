package com.tangem.TangemSdkReactNative

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.squareup.moshi.FromJson
import com.squareup.moshi.ToJson
import com.squareup.sqldelight.android.AndroidSqliteDriver
import com.tangem.*
import com.tangem.commands.common.card.CardType
import com.tangem.commands.common.jsonConverter.MoshiJsonConverter
import com.tangem.commands.file.FileData
import com.tangem.commands.file.FileSettingsChange
import com.tangem.common.CardValuesDbStorage
import com.tangem.common.CompletionResult
import com.tangem.common.extensions.hexToBytes
import com.tangem.tangem_sdk_new.DefaultSessionViewDelegate
import com.tangem.tangem_sdk_new.TerminalKeysStorage
import com.tangem.tangem_sdk_new.extensions.localizedDescription
import com.tangem.tangem_sdk_new.nfc.NfcManager
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.*

class TangemSdkReactNativeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private lateinit var nfcManager: NfcManager
    private lateinit var cardManagerDelegate: DefaultSessionViewDelegate
    private lateinit var sdk: TangemSdk
    private val handler = Handler(Looper.getMainLooper())

    private var nfcManagerStarted = false

    override fun getName(): String {
        return "RNTangemSdk"
    }

    override fun initialize() {
        super.initialize()

        val activity = currentActivity ?: return

        wActivity = WeakReference(activity)

        nfcManager = NfcManager().apply { setCurrentActivity(activity) }
        cardManagerDelegate = DefaultSessionViewDelegate(nfcManager, nfcManager.reader)
                .apply { this.activity = activity }
        val config = Config(cardFilter = CardFilter(EnumSet.of(CardType.Release)))
        val valueStorage = CardValuesDbStorage(AndroidSqliteDriver(Database.Schema, activity.application, "rn_cards.db"))
        val keyStorage = TerminalKeysStorage(activity.application)

        sdk = TangemSdk(nfcManager.reader, cardManagerDelegate, config, valueStorage, keyStorage)
        nfcManager.onStart()
        nfcManagerStarted = true
    }

    override fun onHostResume() {
        if (!::nfcManager.isInitialized) return
        val activity = wActivity.get() ?: return

        if (activity.isDestroyed() || activity.isFinishing()) {
            initialize()
        }
        if (!nfcManagerStarted) nfcManager.onStart()
    }

    override fun onHostPause() {
        if (::nfcManager.isInitialized) {
            nfcManager.onStop()
            nfcManagerStarted = false
        }
    }

    override fun onHostDestroy() {
        if (::nfcManager.isInitialized) {
            nfcManager.onDestroy()
            nfcManagerStarted = false
        }
    }

    @ReactMethod
    fun scanCard(param: ReadableMap, promise: Promise) {
        try {
            sdk.scanCard(param.extractOptional("initialMessage")) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun verify(param: ReadableMap, promise: Promise) {
        try {
            sdk.verify(
                    param.extractOptional("online") ?: false,
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun purgeWallet(param: ReadableMap, promise: Promise) {
        try {
            sdk.purgeWallet(
                    param.extract("walletIndex"),
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun sign(param: ReadableMap, promise: Promise) {
        try {
            sdk.sign(
                    param.extract("hashes") as Array<ByteArray>,
                    param.extract("walletPublicKey"),
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun readIssuerData(param: ReadableMap, promise: Promise) {
        try {
            sdk.readIssuerData(
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun writeIssuerData(param: ReadableMap, promise: Promise) {
        try {
            sdk.writeIssuerData(
                    param.extractOptional("cardId"),
                    param.extract("issuerData"),
                    param.extract("issuerDataSignature"),
                    param.extractOptional("issuerDataCounter"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun readIssuerExtraData(param: ReadableMap, promise: Promise) {
        try {
            sdk.readIssuerExtraData(
                    param.extractOptional("issuerDataCounter"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun writeIssuerExtraData(param: ReadableMap, promise: Promise) {
        try {
            sdk.writeIssuerExtraData(
                    param.extractOptional("cardId"),
                    param.extract("issuerData"),
                    param.extract("startingSignature"),
                    param.extract("finalizingSignature"),
                    param.extractOptional("issuerDataCounter"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun readUserData(param: ReadableMap, promise: Promise) {
        try {
            sdk.readUserData(
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun writeUserData(param: ReadableMap, promise: Promise) {
        try {
            sdk.writeUserData(
                    param.extractOptional("cardId"),
                    param.extract("userData"),
                    param.extractOptional("userCounter"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun writeUserProtectedData(param: ReadableMap, promise: Promise) {
        try {
            sdk.writeUserProtectedData(
                    param.extractOptional("cardId"),
                    param.extract("userProtectedData"),
                    param.extractOptional("userProtectedCounter"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun changePin1(param: ReadableMap, promise: Promise) {
        try {
            sdk.changePin1(
                    param.extractOptional("cardId"),
                    param.extractOptional("pin"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun changePin2(param: ReadableMap, promise: Promise) {
        try {
            sdk.changePin2(
                    param.extractOptional("cardId"),
                    param.extractOptional("pin"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun readFiles(param: ReadableMap, promise: Promise) {
        try {
            val readFiles: FileCommand.Read = converter.fromJson(converter.toJson(param.toHashMap()))!!
            sdk.readFiles(
                    readFiles.readPrivateFiles,
                    readFiles.indices,
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun writeFiles(param: ReadableMap, promise: Promise) {
        try {
            val writeFiles: FileCommand.Write = converter.fromJson(converter.toJson(param.toHashMap()))!!
            sdk.writeFiles(
                    writeFiles.files,
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun deleteFiles(param: ReadableMap, promise: Promise) {
        try {
            val deleteFiles: FileCommand.Delete = converter.fromJson(converter.toJson(param.toHashMap()))!!
            sdk.deleteFiles(
                    deleteFiles.indices,
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }

    @ReactMethod
    fun changeFilesSettings(param: ReadableMap, promise: Promise) {
        try {
            val changeSettings: FileCommand.ChangeSettings = converter.fromJson(converter.toJson(param.toHashMap()))!!
            sdk.changeFilesSettings(
                    changeSettings.changes,
                    param.extractOptional("cardId"),
                    param.extractOptional("initialMessage")
            ) { handleResult(it, promise) }
        } catch (ex: Exception) {
            handleException(ex, promise)
        }
    }


    @ReactMethod
    fun getNFCStatus(promise: Promise) {
        val nfcAdapter = NfcAdapter.getDefaultAdapter(reactContext)

        val payload = Arguments.createMap()

        if (nfcAdapter != null) {
            payload.putBoolean("support", true)
            if (nfcAdapter.isEnabled) {
                payload.putBoolean("enabled", true)
            } else {
                payload.putBoolean("enabled", false)
            }
        } else {
            payload.putBoolean("support", false)
            payload.putBoolean("enabled", false)
        }

        return promise.resolve(payload)
    }

    private fun sendEvent(event: String, payload: WritableMap) {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(event, payload)
    }

    private val mReceiver: BroadcastReceiver =
            object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent) {
                    val action = intent.action
                    if (action == NfcAdapter.ACTION_ADAPTER_STATE_CHANGED) {
                        val state = intent.getIntExtra(
                                NfcAdapter.EXTRA_ADAPTER_STATE, NfcAdapter.STATE_OFF
                        )
                        val payload = Arguments.createMap()
                        when (state) {
                            NfcAdapter.STATE_OFF -> {
                                payload.putBoolean("enabled", false)
                                sendEvent("NFCStateChange", payload)
                            }
                            NfcAdapter.STATE_ON -> {
                                payload.putBoolean("enabled", true)
                                sendEvent("NFCStateChange", payload)
                            }
                        }
                    }
                }
            }

    private fun handleResult(completionResult: CompletionResult<*>, promise: Promise) {
        when (completionResult) {
            is CompletionResult.Success<*> -> {
                handler.post { promise.resolve(normalizeResponse(completionResult.data)) }
            }
            is CompletionResult.Failure<*> -> {
                val error = completionResult.error
                val errorMessage = if (error is TangemSdkError) {
                    val activity = wActivity.get()
                    if (activity == null) error.customMessage else error.localizedDescription(activity)
                } else {
                    error.customMessage
                }
                handler.post {
                    promise.reject("${error.code}", errorMessage, null)
                }
            }
        }
    }

    private fun normalizeResponse(resp: Any?): WritableMap {
        val jsonString = converter.toJson(resp)
        val jsonObject = JSONObject(jsonString)
        return toWritableMap(jsonObject)
    }

    @Throws(JSONException::class)
    fun toWritableMap(jsonObject: JSONObject): WritableMap {
        val writableMap = Arguments.createMap()
        val iterator = jsonObject.keys()
        while (iterator.hasNext()) {
            val key = iterator.next() as String
            val value = jsonObject.get(key)
            if (value is Float || value is Double) {
                writableMap.putDouble(key, jsonObject.getDouble(key))
            } else if (value is Number) {
                writableMap.putInt(key, jsonObject.getInt(key))
            } else if (value is String) {
                writableMap.putString(key, jsonObject.getString(key))
            } else if (value is Boolean) {
                writableMap.putBoolean(key, jsonObject.getBoolean(key))
            } else if (value is JSONObject) {
                writableMap.putMap(key, toWritableMap(jsonObject.getJSONObject(key)))
            } else if (value is JSONArray) {
                writableMap.putArray(key, toWritableMap(jsonObject.getJSONArray(key)))
            } else if (value === JSONObject.NULL) {
                writableMap.putNull(key)
            }
        }

        return writableMap
    }

    @Throws(JSONException::class)
    fun toWritableMap(jsonArray: JSONArray): WritableArray {
        val writableArray = Arguments.createArray()
        for (i in 0 until jsonArray.length()) {
            val value = jsonArray.get(i)
            if (value is Float || value is Double) {
                writableArray.pushDouble(jsonArray.getDouble(i))
            } else if (value is Number) {
                writableArray.pushInt(jsonArray.getInt(i))
            } else if (value is String) {
                writableArray.pushString(jsonArray.getString(i))
            } else if (value is Boolean) {
                writableArray.pushBoolean(jsonArray.getBoolean(i))
            } else if (value is JSONObject) {
                writableArray.pushMap(toWritableMap(jsonArray.getJSONObject(i)))
            } else if (value is JSONArray) {
                writableArray.pushArray(toWritableMap(jsonArray.getJSONArray(i)))
            } else if (value === JSONObject.NULL) {
                writableArray.pushNull()
            }
        }
        return writableArray
    }

    private fun handleException(ex: Exception, promise: Promise) {
        handler.post {
            val code = 9999
            val localizedDescription: String = ex.toString()
            promise.reject("$code", localizedDescription, null)
        }
    }

    init {
        reactContext.addLifecycleEventListener(this)
        val filter = IntentFilter(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED)
        reactContext.registerReceiver(mReceiver, filter)
    }

    @Throws(Exception::class)
    inline fun <reified T> ReadableMap.extract(name: String): T {
        return this.extractOptional(name) ?: throw NoSuchFieldException(name)
    }

    inline fun <reified T> ReadableMap.extractOptional(name: String): T? {
        val map = this.toHashMap()
        val argument = map[name] ?: return null

        if (argument is String && T::class.java == ByteArray::class.java) {
            return argument.hexToBytes() as T
        }

        return if (argument is String) {
            argument as T
        } else {
            val json = converter.toJson(argument)
            converter.fromJson<T>(json)!!
        }
    }

    companion object {
        lateinit var wActivity: WeakReference<Activity?>

        val converter = createMoshiJsonConverter()

        private fun createMoshiJsonConverter(): MoshiJsonConverter {
            val adapters = MoshiJsonConverter.getTangemSdkAdapters().toMutableList()
            adapters.add(MoshiAdapters.DataToWriteAdapter())
            adapters.add(MoshiAdapters.DataProtectedBySignatureAdapter())
            adapters.add(MoshiAdapters.DataProtectedByPasscodeAdapter())
            val converter = MoshiJsonConverter(adapters)
            MoshiJsonConverter.setInstance(converter)
            return converter
        }
    }

    sealed class FileCommand {
        data class Read(val readPrivateFiles: Boolean = false, val indices: List<Int>? = null)
        data class Write(val files: List<FileData>)
        data class Delete(val indices: List<Int>?)
        data class ChangeSettings(val changes: List<FileSettingsChange>)
    }
}

class MoshiAdapters {

    class DataToWriteAdapter {
        @ToJson
        fun toJson(src: FileData): String {
            return when (src) {
                is FileData.DataProtectedBySignature -> DataProtectedBySignatureAdapter().toJson(src)
                is FileData.DataProtectedByPasscode -> DataProtectedByPasscodeAdapter().toJson(src)
            }
        }

        @FromJson
        fun fromJson(map: MutableMap<String, Any>): FileData {
            return if (map.containsKey("signature")) {
                DataProtectedBySignatureAdapter().fromJson(map)
            } else {
                DataProtectedByPasscodeAdapter().fromJson(map)
            }
        }
    }

    class DataProtectedBySignatureAdapter {
        @ToJson
        fun toJson(src: FileData.DataProtectedBySignature): String = MoshiJsonConverter.default().toJson(src)

        @FromJson
        fun fromJson(map: MutableMap<String, Any>): FileData.DataProtectedBySignature {
            val converter = MoshiJsonConverter.default()
            return converter.fromJson(converter.toJson(map))!!
        }
    }

    class DataProtectedByPasscodeAdapter {
        @ToJson
        fun toJson(src: FileData.DataProtectedByPasscode): String = MoshiJsonConverter.default().toJson(src)

        @FromJson
        fun fromJson(map: MutableMap<String, Any>): FileData.DataProtectedByPasscode {
            val converter = MoshiJsonConverter.default()
            return converter.fromJson(converter.toJson(map))!!
        }
    }
}