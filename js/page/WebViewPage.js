/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {WebView, StyleSheet, DeviceInfo, View, TouchableOpacity} from 'react-native';
import NavigationBar from '../common/component/NavigationBar';
import NavigationUtil from '../navigator/NavigationUtil';
import ViewUtils from '../utils/ViewUtils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackPressComponent from "../common/component/BackPressComponent";
import FavoriteDao from "../common/dao/FavoriteDao";

type Props = {};
export default class WebViewPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        const {title,url} = this.params;
        this.state = {
            title: title,
            url: url,
            canGoBack: false,
        };
        this.backPress = new BackPressComponent({backPress: () => this.onBackPress()});
    }

    componentDidMount() {
        this.backPress.componentDidMount()
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount()
    }

    onBackPress() {
        this.onBack();
        return true;
    };

    onBack() {
        if (this.state.canGoBack) {
            this.webView.goBack();
        } else {
            NavigationUtil.goBack(this.props.navigation);
        }
    }

    onNavigationStateChange(navState) {
        this.setState({
            canGoBack: navState.canGoBack,
            url: navState.url,
        })
    }

    render() {
        const {theme} = this.params;
        let navigationBar = <NavigationBar
            title={this.state.title}
            style={theme.styles.navBar}
            leftButton={ViewUtils.getLeftBackButton(() => this.onBackPress())}
        />;
        return (
            <View style={styles.container}>
                {navigationBar}
                <WebView
                    ref={webView => this.webView = webView}
                    startInLoadingState={true}
                    onNavigationStateChange={e => this.onNavigationStateChange(e)}
                    source={{uri: this.state.url}}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});
