/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../navigator/NavigationUtil';
import {ScrollView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NavigationBar from "../common/component/NavigationBar";
import {MoreMenu} from "../common/component/MoreMenu";
import GlobalStyles from "../res/styles/GlobalStyles";
import ViewUtils from "../utils/ViewUtils";
import {FLAG_LANGUAGE} from "../common/dao/LanguageDao";
import actions from "../action";
import {connect} from "react-redux";

type Props = {};
class MinePage extends Component<Props> {
    getRightButton() {
        return <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                onPress={() => {
                }}>
                <View style={{padding: 5, marginRight: 8}}>
                    <Feather
                        name={'search'}
                        size={24}
                        style={{color: 'white'}}
                    />
                </View>
            </TouchableOpacity>
        </View>
    }

    getLeftButton(callback) {
        return <TouchableOpacity
            style={{padding: 8, paddingLeft: 12}}
            onPress={callback}>
            <Ionicons
                name={'ios-arrow-back'}
                size={26}
                style={{color: 'white'}}/>
        </TouchableOpacity>
    }

    onClick(menu) {
        let RouteName, params = {};
        const {theme} = this.props;
        params.theme = theme;
        switch (menu) {
            case MoreMenu.Tutorial:
                RouteName = 'WebViewPage';
                params.title='教程';
                params.url="https://coding.m.imooc.com/classindex.html?cid=89";
                break;
            case MoreMenu.About:
                RouteName = 'AboutPage';
                break;
            case MoreMenu.AboutAuthor:
                RouteName = 'AboutMePage';
                break;
            case MoreMenu.SortKey:
                RouteName = 'SortKeyPage';
                params.flag = FLAG_LANGUAGE.flag_key;
                break;
            case MoreMenu.SortLanguage:
                RouteName = 'SortKeyPage';
                params.flag = FLAG_LANGUAGE.flag_language;
                break;
            case MoreMenu.CustomTheme:
                const {onShowCustomThemeView} = this.props;
                onShowCustomThemeView(true);
                break;
            case MoreMenu.CustomKey:
            case MoreMenu.CustomLanguage:
            case MoreMenu.RemoveKey:
                RouteName = 'CustomKeyPage';
                params.isRemoveKey = menu === MoreMenu.RemoveKey;
                params.flag = menu !== MoreMenu.CustomLanguage ? FLAG_LANGUAGE.flag_key : FLAG_LANGUAGE.flag_language;
                break;
        }
        if (RouteName) {
            NavigationUtil.goPage(params,RouteName);
        }
    }

    getItem(menu) {
        const {theme} = this.props;
        return ViewUtils.getMenuItem(() => this.onClick(menu), menu, theme.themeColor);
    }

    render() {
        const {theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: 'light-content',
        };
        let navigationBar = <NavigationBar
            title={'我的'}
            statusBar={statusBar}
            style={theme.styles.navBar}
            rightButton={this.getRightButton()}
            leftButton={this.getLeftButton()}
        />;
        return (
            <View style={GlobalStyles.root_container}>
                {navigationBar}
                <ScrollView>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => this.onClick(MoreMenu.About)}>
                        <View style={styles.about_left}>
                            <Ionicons
                                name={MoreMenu.About.icon}
                                size={40}
                                style={{
                                    marginRight: 10,
                                    color: theme.themeColor,
                                }}
                            />
                            <Text>GitHub Popular</Text>
                        </View>
                        <Ionicons
                            name={'ios-arrow-forward'}
                            size={16}
                            style={{
                                marginRight: 10,
                                alignSelf: 'center',
                                color: theme.themeColor,
                            }}
                        />
                    </TouchableOpacity>
                    <View style={GlobalStyles.line}/>
                    {this.getItem(MoreMenu.Tutorial)}
                    {/*趋势管理*/}
                    <Text style={styles.groupTitle}>趋势管理</Text>
                    {/*自定义语言*/}
                    {this.getItem(MoreMenu.CustomLanguage)}
                    <View style={GlobalStyles.line}/>
                    {/*语言排序*/}
                    {this.getItem(MoreMenu.SortLanguage)}
                    {/*最热管理*/}
                    <Text style={styles.groupTitle}>最热管理</Text>
                    {/*自定义标签*/}
                    {this.getItem(MoreMenu.CustomKey)}
                    {/*标签排序*/}
                    <View style={GlobalStyles.line}/>
                    {this.getItem(MoreMenu.SortKey)}
                    {/*标签移除*/}
                    <View style={GlobalStyles.line}/>
                    {this.getItem(MoreMenu.RemoveKey)}

                    {/*设置*/}
                    <Text style={styles.groupTitle}>设置</Text>
                    {/*自定义主题*/}
                    {this.getItem(MoreMenu.CustomTheme)}
                    {/*关于作者*/}
                    <View style={GlobalStyles.line}/>
                    {this.getItem(MoreMenu.AboutAuthor)}
                    <View style={GlobalStyles.line}/>
                    {/*反馈*/}
                    {this.getItem(MoreMenu.Feedback)}
                    <View style={GlobalStyles.line}/>
                    {this.getItem(MoreMenu.CodePush)}
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme,
});
const mapDispatchToProps = dispatch => ({
    onShowCustomThemeView: (show) => dispatch(actions.onShowCustomThemeView(show))
});
export default connect(mapStateToProps,mapDispatchToProps)(MinePage)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    about_left: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    item: {
        backgroundColor: 'white',
        padding: 10,
        height: 90,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    groupTitle: {
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 5,
        fontSize: 12,
        color: 'gray',
    }
});
