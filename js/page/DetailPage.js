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

const TRENDING_URL = "https://github.com/";
type Props = {};
export default class DetailPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        const {projectModel,flag} = this.params;
        this.favoriteDao = new FavoriteDao(flag);
        this.url = projectModel.item.html_url || TRENDING_URL + projectModel.item.fullName;
        const title = projectModel.item.full_name || projectModel.item.fullName;
        this.state = {
            title: title,
            url: this.url,
            canGoBack: false,
            isFavorite: projectModel.isFavorite,
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

    onFavoriteButtonClick() {
        const {projectModel,callback} = this.params;
        const isFavorite = projectModel.isFavorite = !projectModel.isFavorite;
        callback(isFavorite);//更新收藏状态
        this.setState({
            isFavorite: isFavorite,
        });
        let key = projectModel.item.fullName ? projectModel.item.fullName : projectModel.item.id.toString();
        if (projectModel.isFavorite) {
            this.favoriteDao.saveFavoriteItem(key, JSON.stringify(projectModel.item));
        } else {
            this.favoriteDao.removeFavoriteItem(key);
        }
    }

    renderRightButton() {
        return (
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                    onPress={() => this.onFavoriteButtonClick()}>
                    <FontAwesome
                        name={this.state.isFavorite ? 'star' : 'star-o'}
                        size={20}
                        style={{color: 'white', marginRight: 10}}/>
                </TouchableOpacity>
                {
                    ViewUtils.getShareButton(() => {

                    })
                }
            </View>
        )
    }

    onNavigationStateChange(navState) {
        this.setState({
            canGoBack: navState.canGoBack,
            url: navState.url,
        })
    }

    render() {
        const {theme} = this.params;
        const titleLayoutStyle = this.state.title.length> 20 ? {paddingRight: 30} : null;
        let navigationBar = <NavigationBar
            titleLayoutStyle={titleLayoutStyle}
            leftButton={ViewUtils.getLeftBackButton(() => this.onBack())}
            rightButton={this.renderRightButton()}
            title={this.state.title}
            style={theme.styles.navBar}
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
