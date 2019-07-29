/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../../navigator/NavigationUtil';
import {StyleSheet, View, Linking, Clipboard} from 'react-native';
import {MoreMenu} from "../../common/component/MoreMenu";
import ViewUtils from "../../utils/ViewUtils";
import AboutCommon from "./AboutCommon";
import config from '../../res/data/config';
import GlobalStyles from "../../res/styles/GlobalStyles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from 'react-native-easy-toast';

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
            flagAbout: FLAG_ABOUT.flag_about_me,
        }, data => this.setState({...data}))
        this.state = {
            data: config,
            showTutorial: true,
            showBlog: false,
            showQQ: false,
            showContact: false
        }
    }

    onClick(tab) {
        if (!tab) return;
        if (tab.url) {
            const {theme} = this.params;
            NavigationUtil.goPage({
                theme: theme,
                title: tab.title,
                url: tab.url
            }, 'WebViewPage')
            return;
        }
        if (tab.account && tab.account.indexOf('@') > -1) {
            const url = "mailto://" + tab.account;
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
        }
        if (tab.account) {
            Clipboard.setString(tab.account);
            this.toast.show(tab.title + tab.account + '已复制到剪贴板');
        }
    }

    _item(data, isShow, key) {
        const {theme} = this.params;
        return ViewUtils.getSettingItem(() => {
                this.setState({
                    [key]: !this.state[key],
                })
            }, data.name, theme.themeColor, Ionicons, data.icon, isShow ? 'ios-arrow-up' : 'ios-arrow-down'
        );
    }

    /**
     * 显示列表数据
     * @param dic
     * @param isShowAccount
     */
    renderItems(dic, isShowAccount) {
        if (!dic) return null;
        let views = [];
        const {theme} = this.params;
        for (let i in dic) {
            let title = isShowAccount ? dic[i].title + ':' + dic[i].account : dic[i].title;
            views.push(
                <View key={i}>
                    {ViewUtils.getSettingItem(() => this.onClick(dic[i]), title, theme.themeColor)}
                    <View style={GlobalStyles.line}/>
                </View>
            )
        }

        return views;
    }


    render() {
        const content = <View>
            {this._item(this.state.data.aboutMe.Tutorial, this.state.showTutorial, 'showTutorial')}
            <View style={GlobalStyles.line}/>
            {this.state.showTutorial ? this.renderItems(this.state.data.aboutMe.Tutorial.items) : null}

            {this._item(this.state.data.aboutMe.Blog, this.state.showBlog, 'showBlog')}
            <View style={GlobalStyles.line}/>
            {this.state.showBlog ? this.renderItems(this.state.data.aboutMe.Blog.items) : null}

            {this._item(this.state.data.aboutMe.QQ, this.state.showQQ, 'showQQ')}
            <View style={GlobalStyles.line}/>
            {this.state.showQQ ? this.renderItems(this.state.data.aboutMe.QQ.items) : null}

            {this._item(this.state.data.aboutMe.Contact, this.state.showContact, 'showContact')}
            <View style={GlobalStyles.line}/>
            {this.state.showContact ? this.renderItems(this.state.data.aboutMe.Contact.items) : null}
        </View>;
        return <View style={{flex: 1}}>
            {this.aboutCommon.render(content, this.state.data.author)}
            <Toast
                ref={toast => this.toast = toast}
                position={'center'}/>
        </View>
    }
}