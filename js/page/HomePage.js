/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../navigator/NavigationUtil';
import DynamicTabNavigator from '../navigator/DynamicTabNavigator';
import {StyleSheet} from 'react-native';
import {BackHandler} from 'react-native';
import {NavigationActions} from 'react-navigation';

type Props = {};
export default class HomePage extends Component<Props> {
    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    }

    componentWillMount() {
        BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    }

    //处理Android中的物理返回键
    onBackPress = () => {
        const {dispatch, nav} = this.props;
        if (nav.routes[1].index === 0) {
            return false;
        }
        dispatch(NavigationActions.back());
        return true;
    };

    render() {
        NavigationUtil.navigation = this.props.navigation;
        return <DynamicTabNavigator/>;
    }
}

const mapStateToProps = state => ({
    nav: state.nav,
});
export default connect(mapStateToProps)(HomePage)
