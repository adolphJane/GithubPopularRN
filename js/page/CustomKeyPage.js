/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createAppContainer, createMaterialTopTabNavigator} from 'react-navigation';
import NavigationBar from '../common/component/NavigationBar';
import PopularItem from '../common/component/item/PopularItem';
import Toast from 'react-native-easy-toast';
import CheckBox from 'react-native-check-box';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RefreshControl, ScrollView, StyleSheet, ActivityIndicator, Text, View, Alert} from 'react-native';
import {connect} from 'react-redux';
import actions from '../action/index';
import NavigationUtil from "../navigator/NavigationUtil";
import FavoriteDao from "../common/dao/FavoriteDao";
import {FLAG_STORE} from "../common/dao/DataStore";
import FavoriteUtils from "../utils/FavoriteUtils";
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";
import LanguageDao, {FLAG_LANGUAGE} from "../common/dao/LanguageDao";
import BackPressComponent from "../common/component/BackPressComponent";
import ViewUtils from "../utils/ViewUtils";
import Utils from "../utils/Utils";

const URL = "https://api.github.com/search/repositories?q=";
const QUERY_STR = "&sort=stars";
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORE.flag_popular);

type Props = {};

class CustomKeyPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.backPress = new BackPressComponent({backPress: () => this.onBackPress()});
        this.changeValues = [];
        this.isRemoveKey = !!this.params.isRemoveKey;
        this.languageDao = new LanguageDao(this.params.flag);
        this.state = {
            keys: [],
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.keys !== CustomKeyPage._keys(nextProps, null, prevState)) {
            return {
                keys: CustomKeyPage._keys(nextProps, null, prevState),
            }
        }
        return null;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        //如果props中标签为空则从本地存储中获取标签
        if (CustomKeyPage._keys(this.props).length === 0) {
            let {onLoadLanguage} = this.props;
            onLoadLanguage(this.params.flag);
        }
        this.setState({
            keys: CustomKeyPage._keys(this.props),
        })
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    /**
     * 获取标签
     * @param props
     * @param original  移除标签时使用，是否从props获取原始对的标签
     * @param state     移除标签时使用
     * @private
     */
    static _keys(props, original, state) {
        const {flag, isRemoveKey} = props.navigation.state.params;
        let key = flag === FLAG_LANGUAGE.flag_key ? 'keys' : 'languages';
        if (isRemoveKey && !original) {
            //如果state中的key为空则从props中获取
            return state && state.keys && state.keys.length !== 0 && state.keys || props.language[key].map(val => {
                return {
                    //注意，不直接修改props,copy一份
                    ...val,
                    checked: false,
                };
            });
        } else {
            return props.language[key];
        }
    }

    onBackPress() {
        NavigationUtil.goBack(this.props.navigation);
        return true;
    }

    onSave() {
        if (this.changeValues.length === 0) {
            NavigationUtil.goBack(this.props.navigation);
            return;
        }
        let keys;
        if (this.isRemoveKey) {
            //移除标签的特殊处理
            for (let i = 0, l = this.changeValues.length; i < l; i++) {
                Utils.remove(keys = CustomKeyPage._keys(this.props, true), this.changeValues[i], 'name');
            }
        }
        //更新本地数据
        this.languageDao.save(keys || this.state.keys);
        const {onLoadLanguage} = this.props;
        //更新store
        onLoadLanguage(this.params.flag);
        NavigationUtil.goBack(this.props.navigation);
    }

    onClick(data, index) {
        data.checked = !data.checked;
        Utils.updateArray(this.changeValues, data);
        this.state.keys[index] = data;//更新state以便显示选中状态 、
        this.setState({
            keys: this.state.keys
        })
    }

    onBack() {
        if (this.changeValues.length > 0) {
            Alert.alert('提示', '要保存修改吗?',
                [
                    {
                        text: '否',
                        onPress: () => {
                            NavigationUtil.goBack(this.props.navigation)
                        }
                    },
                    {
                        text: '是',
                        onPress: () => {
                            this.onSave();
                        }
                    }
                ]
            )
        } else {
            NavigationUtil.goBack(this.props.navigation)
        }
    }

    renderView() {
        let dataArray = this.state.keys;
        if (!dataArray || dataArray.length === 0) return;
        let len = dataArray.length;
        let views = [];
        for (let i = 0, l = len; i < l; i += 2) {
            views.push(
                <View keys={i}>
                    <View style={styles.item}>
                        {this.renderCheckBox(dataArray[i], i)}
                        {i + 1 < len && this.renderCheckBox(dataArray[i + 1], i + 1)}
                    </View>
                    <View style={styles.line}/>
                </View>
            )
        }
        return views;
    }

    _checkedImage(checked) {
        const {theme} = this.params;
        return <Ionicons
            name={checked ? 'ios-checkbox' : 'md-square-outline'}
            size={20}
            style={{color: theme.themeColor,}}
        />
    }

    renderCheckBox(data, index) {
        return <CheckBox
            style={{flex: 1, padding: 10}}
            onClick={() => this.onClick(data, index)}
            isChecked={data.checked}
            leftText={data.name}
            checkedImage={this._checkedImage(true)}
            unCheckedImage={this._checkedImage(false)}
        />
    }

    render() {
        const {theme} = this.params;
        let title = this.isRemoveKey ? '标签移除' : '自定义标签';
        title = this.params.flag === FLAG_LANGUAGE.flag_language ? '自定义语言' : title;
        let rightButtonTitle = this.isRemoveKey ? '移除' : '保存';
        let navigationBar = <NavigationBar
            title={title}
            style={theme.styles.navBar}
            leftButton={ViewUtils.getLeftBackButton(() => this.onBack())}
            rightButton={ViewUtils.getRightButton(rightButtonTitle, () => this.onSave())}
        />;
        return <View style={styles.container}>
            {navigationBar}
            <ScrollView>
                {this.renderView()}
            </ScrollView>
        </View>
    }
}

const mapPopularStateToProps = state => ({
    language: state.language,
});

const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(CustomKeyPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
    },
    line: {
        flex: 1,
        height: 0.3,
        backgroundColor: 'darkgray',
    }
});