/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../../navigator/NavigationUtil';
import {StyleSheet, View, Linking} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MoreMenu} from "../../common/component/MoreMenu";
import ViewUtils from "../../utils/ViewUtils";
import AboutCommon from "./AboutCommon";
import config from '../../res/data/config';
import GlobalStyles from "../../res/styles/GlobalStyles";

type Props = {};

export const FLAG_ABOUT = {
    flag_about: 'about', flag_about_me: 'about_me',
};

export default class AboutPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.aboutCommon = new AboutCommon({
            ...this.params,
            navigation: this.props.navigation,
            flagAbout: FLAG_ABOUT.flag_about,
        }, data => this.setState({...data}))
        this.state = {
            data: config,
        }
    }

    onClick(menu) {
        const {theme} = this.params;
        let RouteName, params = {};
        params.theme = theme;
        switch (menu) {
            case MoreMenu.Tutorial:
                RouteName = 'WebViewPage';
                params.title = '教程';
                params.url = "https://coding.m.imooc.com/classindex.html?cid=89";
                break;
            case MoreMenu.Feedback:
                const url = "mailto://adolphdeveloper@gmail.com";
                Linking.canOpenURL(url)
                    .then(support => {
                        if (!support) {
                            console.log('Can\'t handle url:' + url);
                        } else {
                            Linking.openURL(url);
                        }
                    })
                    .catch(e => {
                        console.error(e);
                    });
                break;
            case MoreMenu.AboutAuthor:
                RouteName = 'AboutMePage';
                break;
        }
        if (RouteName) {
            NavigationUtil.goPage(params, RouteName);
        }
    }

    getItem(menu) {
        const {theme} = this.params;
        return ViewUtils.getMenuItem(() => this.onClick(menu), menu, theme.themeColor);
    }

    render() {
        const content = <View>
            {this.getItem(MoreMenu.Tutorial)}
            <View style={GlobalStyles.line}/>
            {this.getItem(MoreMenu.AboutAuthor)}
            <View style={GlobalStyles.line}/>
            {this.getItem(MoreMenu.Feedback)}
        </View>;
        return this.aboutCommon.render(content, this.state.data.app);
    }
}