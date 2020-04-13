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
  StatusBar,
  Image,
} from 'react-native';

import { Container, Header, Title, Content, Button, Icon, Card, CardItem, Text, Body, Left, Right, IconNB, View } from "native-base";
import Background from "./assets/background.jpg";
import { BLEBot, BLEBotStatus } from './src/BLEBot';

declare var global: {HermesInternal: null | {}};

interface AppProps {

}

interface AppState {
  uptime?: number
}

export default class App extends Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    this.state = {};

    BLEBot.addListener("status", this.bleStatus);
    BLEBot.addListener("update", this.onUpdate);
  }

  onUpdate = (update: string) => {
    if(update) {
      const split = update.split(" ");
      if(split.length >= 4) {
        this.setState({
          uptime: parseInt(split[3])
        })
      }
    }
  };

  tryRestart(immediate?: boolean) {
    if(immediate) {
      BLEBot.start().then(() => {}).catch(err => console.warn(err));
    } else {
      setTimeout(() => this.tryRestart(true), 5000);
    }
  }

  private bleStatus = (status:BLEBotStatus) => {
    if(status == BLEBotStatus.STOPPED) {
      this.tryRestart();
    }
  }

  componentDidMount() {
    this.tryRestart(true);
  }

  componentWillUnmount() {

  }

  render() {
    const { uptime } = this.state;
    return (
      <>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor={'transparent'}/>
        <SafeAreaView>
          <View style={{width: "100%", height: "100%"}}>
            <Image source={Background}  style={{width: "100%", height: "100%"}}/>
            <View style={styles.mainView}>
                <ScrollView
                  contentInsetAdjustmentBehavior="automatic"
                  style={styles.scrollView}>

                    <View style={{width: 1, height: 24}} />

                    {
                      !!uptime && <Text style={{color:"white"}}>{uptime}</Text>
                    }
                    <Text>
                      Working for {}
                    </Text>
                  <Card>
                    <CardItem bordered>
                      <Text style={{marginBottom: 10}}>
                        The idea with React Native Elements is more about component structure than actual design.
                      </Text>
                    </CardItem>
                  </Card>
                  <Card>
                    <CardItem bordered>
                      <Text style={{marginBottom: 10}}>
                        The idea with React Native Elements is more about component structure than actual design.
                      </Text>
                    </CardItem>
                  </Card>
                </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </>
    );  
  }
}

const styles = StyleSheet.create({
  scrollView: { },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: { },
  mainView: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)"
  }
});