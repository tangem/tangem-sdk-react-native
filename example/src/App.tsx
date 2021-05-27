import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  Alert,
} from 'react-native';

import TangemSdk, { Card } from 'tangem-sdk-react-native-new';

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
    TangemSdk.createWallet().then(this.onSuccess).catch(this.onError);
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
    TangemSdk.purgeWallet(publicKey).then(this.onSuccess).catch(this.onError);
  };

  changePin1 = () => {
    const { card } = this.state;

    // for reset the pinCode set it to '000000'
    const pin = '111';

    if (!card) {
      return Alert.alert('Scan the card first');
    }

    TangemSdk.changePin1(pin).then(this.onSuccess).catch(this.onError);
  };

  changePin2 = () => {
    const { card } = this.state;

    // for reset the pinCode set it to '000'
    const pin = '222';

    if (!card) {
      return Alert.alert('Scan the card first');
    }

    TangemSdk.changePin2(pin).then(this.onSuccess).catch(this.onError);
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

    TangemSdk.sign(hashes, publicKey).then(this.onSuccess).catch(this.onError);
  };

  verify = () => {
    const isOnline = true;
    TangemSdk.verify(isOnline).then(this.onSuccess).catch(this.onError);
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
            <Button onPress={this.verify} title="verify" />
          </View>
          <View style={styles.row}>
            <Button onPress={this.createWallet} title="createWallet" />
            <Button onPress={this.purgeWallet} title="purgeWallet" />
          </View>
          <View style={styles.row}>
            <Button onPress={this.changePin1} title="setPin1" />
            <Button onPress={this.changePin2} title="setPin2" />
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
