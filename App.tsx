/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableNativeFeedback,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { instance } from './src/BLEController';

declare var global: {HermesInternal: null | {}};

interface AppProps {

}

interface AppState {

}

export default class App extends Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    instance.addListener("peripheral_discovered", peripheral => console.warn(peripheral));
  }

  componentDidMount() {
    instance.checkPermission().then(result => instance.scan())
    .then(devices => {
      console.warn("devices", {devices});
      if(!devices || devices.length <= 0) return Promise.resolve(undefined);
      const peripheral = devices[0];

      return instance.connect(peripheral)
      .then(done => instance.retrieveServices(peripheral))
      .then(services => {
        console.warn(services.characteristics);
        const notification = services ? services.characteristics.find(c => "Notify" === c.properties.Notify) : null;
        console.warn({notification});

        if(notification) {
          return instance.startNotification(peripheral, notification);
        } else throw "invalid";
      }).then(() => new Promise((resolve, reject) => {
        setTimeout(() => {
          instance.disconnect(peripheral)
          .then(r => resolve(r))
          .catch(err => reject(err));
        }, 5000);
      }))
      .then(() => console.warn("disconnected !"));
    })
    .catch(err => console.warn(err));
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Header />
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Step One</Text>
                <Text style={styles.sectionDescription}>
                  Edit <Text style={styles.highlight}>App.tsx</Text> to change
                  this screen and then come back to see your edits.
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>See Your Changes</Text>
                <Text style={styles.sectionDescription}>
                  <ReloadInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Debug</Text>
                <Text style={styles.sectionDescription}>
                  <DebugInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Learn More</Text>
                <Text style={styles.sectionDescription}>
                  Read the docs to discover what to do next:
                </Text>
              </View>
              <LearnMoreLinks />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );  
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});