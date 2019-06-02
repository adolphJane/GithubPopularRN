/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../navigator/NavigationUtil';
import {Button, StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import actions from '../action/index';

type Props = {};
class TrendingPage extends Component<Props> {
    render() {
        const {navigation} = this.props;
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to TrendingPage!</Text>
                <Button
                    title={"改变主题颜色"}
                    onPress={() => {
                        this.props.onThemeChange("#096");
                    }}
                />
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

const mapStatetoProps = state => ({});

const mapDispathToProps = dispath => ({
    onThemeChange: theme => dispath(actions.onThemeChange(theme))
});

export default connect(mapStatetoProps, mapDispathToProps)(TrendingPage);