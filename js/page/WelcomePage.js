/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import NavigationUtil from "../navigator/NavigationUtil";

type Props = {};
export default class WelcomePage extends Component<Props> {
  componentDidMount(): void {
    this.timer = setTimeout(() => {
      NavigationUtil.resetToHomePage({
        navigation: this.props.navigation
      })
    }, 200);
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎来到趣读!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
