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
import {RefreshControl,FlatList, StyleSheet, ActivityIndicator, Text, View, DeviceInfo} from 'react-native';
import {connect} from 'react-redux';
import actions from '../action/index';
import NavigationUtil from "../navigator/NavigationUtil";
import FavoriteDao from "../common/dao/FavoriteDao";
import {FLAG_STORE as FLAG_STORAGE, FLAG_STORE} from "../common/dao/DataStore";
import FavoriteUtils from "../utils/FavoriteUtils";
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";
import LanguageDao, {FLAG_LANGUAGE} from "../common/dao/LanguageDao";
import BackPressComponent from "../common/component/BackPressComponent";

const URL = "https://api.github.com/search/repositories?q=";
const QUERY_STR = "&sort=stars";
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORE.flag_popular);

type Props = {};
class SearchPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.backPress = new BackPressComponent({backPress: (e) => this.onBackPress(e)});
        this.favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);
        this.languageDao = new LanguageDao(FLAG_LANGUAGE.flag_key);
        this.isKeyChange = false;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    loadData(loadMore) {
        const {onLoadMoreSearch, onSearch, search, keys} = this.props;
        if (loadMore) {
            onLoadMoreSearch(++search.pageIndex, pageSize, search.items, this.favoriteDao, callback => {
                this.toast.show('没有更多了');
            })
        } else {
            onSearch(this.inputKey, pageSize, this.searchToken = new Date().getTime(), this.favoriteDao, keys, message => {
                this.toast.show(message);
            })
        }
    }

    onBackPress() {
        const {onSearchCancel, onLoadLanguage} = this.props;
        onSearchCancel();//退出时取消搜索
        this.refs.input.blur();
        NavigationUtil.goBack(this.props.navigation);
        if (this.isKeyChange) {
            onLoadLanguage(FLAG_LANGUAGE.flag_key);//重新加载标签
        }
        return true;
    }

    _genTabs() {
        const tabs = {};
        const {keys,theme} = this.props;

        keys.forEach((item,index) => {
            if (item.checked) {
                tabs[`tab${index}`] = {
                    screen: props => <PopularTabPage {...props} tabLabel={item.name} theme={theme}/>,
                    navigationOptions: {
                        title: item.name,
                    }
                }
            }
        });
        return tabs;
    }
    saveKey() {

    }

    render() {
        const {isLoading, projectModels, showBottomButton, hideLoadingMore} = this.props.search;
        const {theme} = this.params;
        let statusBar = null;

        let listView = !isLoading ? <FlatList
            data={projectModels}
            renderItem={data => this.renderItem(data)}
            keyExtractor={item => "" + item.item.id}
            contentInset={
                {
                    bottom: 45
                }
            }
            refreshControl={
                <RefreshControl
                    title={'Loading'}
                    titleColor={theme.themeColor}
                    colors={[theme.themeColor]}
                    refreshing={isLoading}
                    onRefresh={() => this.loadData()}
                    tintColor={theme.themeColor}
                />
            }
            ListFooterComponent={() => this.genIndicator()}
            onEndReached={() => {
                console.log('---onEndReached----');
                setTimeout(() => {
                    if (this.canLoadMore) {//fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
                        this.loadData(true);
                        this.canLoadMore = false;
                    }
                }, 100);
            }}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={() => {
                this.canLoadMore = true; //fix 初始化时页调用onEndReached的问题
                console.log('---onMomentumScrollBegin-----')
            }}
        /> : null;
        let bottomButton = showBottomButton ?
            <TouchableOpacity
                style={[styles.bottomButton, {backgroundColor: theme.themeColor}]}
                onPress={() => {
                    this.saveKey();
                }}
            >
                <View style={{justifyContent: 'center'}}>
                    <Text style={styles.title}>朕收下了</Text>
                </View>
            </TouchableOpacity> : null;
    }
}

const mapPopularStateToProps = state => ({
    search: state.search,
    keys: state.language.keys
});

const mapPopularDispatchToProps = dispatch => ({
    //将 dispatch(onRefreshPopular(storeName, url))绑定到props
    onSearch: (inputKey, pageSize, token, favoriteDao, popularKeys, callBack) => dispatch(actions.onSearch(inputKey, pageSize, token, favoriteDao, popularKeys, callBack)),
    onSearchCancel: (token) => dispatch(actions.onSearchCancel(token)),
    onLoadMoreSearch: (pageIndex, pageSize, dataArray, favoriteDao, callBack) => dispatch(actions.onLoadMoreSearch(pageIndex, pageSize, dataArray, favoriteDao, callBack)),
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps,mapPopularDispatchToProps)(SearchPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabStyle: {
        // minWidth: 50 //fix minWidth会导致tabStyle初次加载时闪烁
        padding: 0
    },
    indicatorStyle: {
        height: 2,
        backgroundColor: 'white'
    },
    labelStyle: {
        fontSize: 13,
        margin: 0,
    },
    indicatorContainer: {
        alignItems: "center"
    },
    indicator: {
        color: 'red',
        margin: 10
    },
    statusBar: {
        height: 20
    },
    bottomButton: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        height: 40,
        position: 'absolute',
        left: 10,
        top: GlobalStyles.window_height - 45 - (DeviceInfo.isIPhoneX_deprecated ? 34 : 0),
        right: 10,
        borderRadius: 3
    },
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    textInput: {
        flex: 1,
        height: (Platform.OS === 'ios') ? 26 : 36,
        borderWidth: (Platform.OS === 'ios') ? 1 : 0,
        borderColor: "white",
        alignSelf: 'center',
        paddingLeft: 5,
        marginRight: 10,
        marginLeft: 5,
        borderRadius: 3,
        opacity: 0.7,
        color: 'white'
    },
    title: {
        fontSize: 18,
        color: "white",
        fontWeight: '500'
    },
});