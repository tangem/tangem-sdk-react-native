import React, { Component } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TangemSdk, {
  Card,
  EllipticCurve,
  FileVisibility,
  OwnerFile,
} from 'tangem-sdk-react-native';

interface ExampleState {
  card?: Card;
  log: String;
  status: {
    enabled: boolean;
    support: boolean;
  };
}

export default class App extends Component<{}> {
  state: ExampleState = {
    card: undefined,
    log: '',
    status: {
      enabled: false,
      support: false,
    },
  };

  componentDidMount() {
    // on nfc state change (Android)
    TangemSdk.on('NFCStateChange', ({ enabled }) => {
      this.setState({
        status: {
          enabled,
          support: true,
        },
      });
    });

    // get currnet nfc status
    TangemSdk.getNFCStatus().then((status) => {
      this.setState({
        status,
      });
    });
  }

  onSuccess = (response: any) => {
    this.setState({
      log: JSON.stringify(response, null, '\t'),
    });
  };

  onError = (error: any) => {
    this.setState({
      log: error.toString(),
    });
  };
  scanCard = () => {
    const initialMessage = { body: 'Hello!!!', header: 'Work now' };
    TangemSdk.scanCard(initialMessage)
      .then((card: Card) => {
        this.setState({
          card,
        });

        this.onSuccess(card);
      })
      .catch(this.onError);
  };

  createWallet = () => {
    const { card } = this.state;
    if (!card) {
      return Alert.alert('Scan the card first');
    }
    TangemSdk.createWallet(EllipticCurve.Ed25519, card.cardId)
      .then(this.onSuccess)
      .catch(this.onError);
  };

  purgeWallet = () => {
    const { card } = this.state;
    if (!card) {
      return Alert.alert('Scan the card first');
    }
    const { wallets } = card;
    if (!wallets || !wallets.length) {
      return Alert.alert('Can not find wallets');
    }
    const { publicKey } = wallets[0];
    if (!publicKey) {
      return Alert.alert('Can not find publicKey');
    }
    TangemSdk.purgeWallet(publicKey, card.cardId)
      .then(this.onSuccess)
      .catch(this.onError);
  };

  setPassCode = () => {
    const { card } = this.state;

    const passcode = 'ABCDEF';

    if (!card) {
      return Alert.alert('Scan the card first');
    }

    TangemSdk.setPasscode(passcode, card.cardId)
      .then(this.onSuccess)
      .catch(this.onError);
  };

  setAccessCode = () => {
    const { card } = this.state;

    const accessCode = 'ABCDEF';

    if (!card) {
      return Alert.alert('Scan the card first');
    }

    TangemSdk.setAccessCode(accessCode, card.cardId)
      .then(this.onSuccess)
      .catch(this.onError);
  };

  sign = () => {
    const { card } = this.state;
    if (!card) {
      return Alert.alert('Scan the card first');
    }

    const hashes = [
      '44617461207573656420666f722068617368696e67',
      '4461746120666f7220757365642068617368696e67',
    ];

    const { wallets } = card;
    if (!wallets || !wallets.length) {
      return Alert.alert('Can not find wallets');
    }
    const { publicKey } = wallets[0];
    if (!publicKey) {
      return Alert.alert('Can not find publicKey');
    }
    const initialMessage = { body: 'This is body', header: 'This is header' };

    TangemSdk.signHashes(
      hashes,
      publicKey,
      card.cardId,
      undefined,
      initialMessage
    )
      .then(this.onSuccess)
      .catch(this.onError);
  };

  writeFiles = () => {
    const { card } = this.state;
    if (!card) {
      return Alert.alert('Scan the card first');
    }
    const { cardId } = card;
    const data = 'AABBCCDDEEFF';
    const fileName = 'test';

    // YOU MUST ENTER YOUR PRIVATE KEY
    const privateKey =
      '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
    const fileCounter = 1;

    TangemSdk.prepareHashes(cardId, data, fileCounter, fileName, privateKey)
      .then(({ startingSignature, finalizingSignature }) => {
        const file: OwnerFile = {
          startingSignature,
          finalizingSignature,
          data,
          fileName,
          counter: fileCounter,
          fileVisibility: FileVisibility.Public,
        };
        TangemSdk.writeFiles([file], cardId)
          .then(this.onSuccess)
          .catch(this.onError);
      })
      .catch(this.onError);
  };
  readFiles = () => {
    const { card } = this.state;
    if (!card) {
      return Alert.alert('Scan the card first');
    }
    TangemSdk.readFiles(true).then(this.onSuccess).catch(this.onError);
  };

  render() {
    const { log, status } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>☆TangemSdk example☆</Text>

          <Text>
            NFC Supported: {status.support.toString()} | NFC Enabled:{' '}
            {status.enabled.toString()}
          </Text>
          <View style={styles.row}>
            <Button onPress={this.scanCard} title="scanCard" />
            <Button onPress={this.sign} title="sign" />
          </View>
          <View style={styles.row}>
            <Button onPress={this.createWallet} title="createWallet" />
            <Button onPress={this.purgeWallet} title="purgeWallet" />
          </View>
          <View style={styles.row}>
            <Button onPress={this.setAccessCode} title="setAccessCode" />
            <Button onPress={this.setPassCode} title="setPassCode" />
          </View>
          <View style={styles.row}>
            <Button onPress={this.writeFiles} title="write" />
            <Button onPress={this.readFiles} title="read" />
          </View>
        </View>

        <ScrollView style={styles.flex1}>
          <Text>{log}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
