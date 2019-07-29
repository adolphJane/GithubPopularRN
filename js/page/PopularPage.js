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
import {FLAG_STORE} from "../common/dao/DataStore";
import FavoriteUtils from "../utils/FavoriteUtils";
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";
import {FLAG_LANGUAGE} from "../common/dao/LanguageDao";

const URL = "https://api.github.com/search/repositories?q=";
const QUERY_STR = "&sort=stars";
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORE.flag_popular);

type Props = {};
class PopularPage extends Component<Props> {
    constructor(props) {
        super(props);
        const {onLoadLanguage} = this.props;
        onLoadLanguage(FLAG_LANGUAGE.flag_key);
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

    render() {
        const {keys,theme} = this.props;

        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: 'light-content',
        };
        let navigationBar = <NavigationBar
            title={'最热'}
            statusBar={statusBar}
            style={theme.styles.navBar}
        />;
        const TabNavigator = keys.length ? createAppContainer(createMaterialTopTabNavigator(this._genTabs(),{
            tabBarOptions: {
                tabStyle: styles.tabStyle,
                upperCaseLabel: false,
                scrollEnabled: true,
                style: {
                    backgroundColor: theme.themeColor,
                    height: 30,
                },
                indicatorStyle: styles.indicatorStyle,
                labelStyle: styles.labelStyle,
            },
            lazy: true,
        })) : null;
        return <View style={{flex: 1, marginTop: 30}}>
            {navigationBar}
            {TabNavigator && <TabNavigator/>}
        </View>;
    }
}

const mapPopularStateToProps = state => ({
    keys: state.language.keys,
    theme: state.theme.theme,
});

const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps,mapPopularDispatchToProps)(PopularPage);

class PopularTab extends Component<Props> {
    constructor(props) {
        super(props);
        const {tabLabel} = this.props;
        this.storeName = tabLabel;
        this.isFavoriteChanged = false;
    }

    componentDidMount() {
        this.loadData(false);
        EventBus.getInstance().addListener(EventTypes.favorite_changed_popular, this.favoriteChangeListener = () => {
            this.isFavoriteChanged = true;
        });

        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.bottomTabSelectListener = (data) => {
           if (data.to === 0 && this.isFavoriteChanged) {
               this.loadData(null,true);
           }
        })
    }

    componentWillUnmount() {
        EventBus.getInstance().removeListener(this.favoriteChangeListener);
        EventBus.getInstance().removeListener(this.bottomTabSelectListener);
    }

    loadData(loadMore, refreshFavorite) {
        const {onRefreshPopular,onLoadMorePopular,onFlushPopularFavorite} = this.props;
        const store = this._store();
        const url = this.genFetchUrl(this.storeName);
        if (loadMore) {
            onLoadMorePopular(this.storeName, ++store.pageIndex, pageSize, store.items, callback=> {
                this.refs.toast.show('没有更多了');
            },favoriteDao)
        } else if (refreshFavorite) {
            onFlushPopularFavorite(this.storeName, store.pageIndex, pageSize, store.items, favoriteDao)
        } else {
            onRefreshPopular(this.storeName, url, pageSize,favoriteDao);
        }
    }

    /**
     * 获取与当前页面有关的数据
     * @private
     */
    _store() {
        const {popular} = this.props;
        let store = popular[this.storeName];
        if (!store) {
            store = {
                items: [],
                isLoading: false,
                projectModels: [], //要显示的数据
                hideLoadingMore: true,//默认隐藏加载更多
            }
        }
        return store;
    }

    genFetchUrl(key) {
        return URL + key + QUERY_STR;
    }

    renderItem(data) {
        let item = data.item;
        const {theme} = this.props;

        return <PopularItem
            projectModel={item}
            theme={theme}
            onSelect={(callback) => {
                NavigationUtil.goPage({
                    theme,
                    projectModel: item,
                    flag: FLAG_STORE.flag_popular,
                    callback,
                }, 'DetailPage');
            }}
            onFavorite={(item, isFavorite) => FavoriteUtils.onFavorite(favoriteDao,item,isFavorite,FLAG_STORE.flag_popular)}
        />
    }

    genIndicator() {
        return this._store().hideLoadingMore ? null :
            <View style={styles.indicatorContainer}>
                <ActivityIndicator
                    style={styles.indicator}
                />
                <Text>
                    正在加载更多
                </Text>
            </View>
    }

    render() {
        let store = this._store();
        const {theme} = this.props;
        return (
            <View style={styles.container}>
                <FlatList
                    data={store.projectModels}
                    renderItem={data => this.renderItem(data)}
                    keyExtractor={item => "" + item.item.id}
                    refreshControl={
                        <RefreshControl
                            title={"Loading"}
                            titleColor={theme.themeColor}
                            colors={[theme.themeColor]}
                            refreshing={store.isLoading}
                            onRefresh={() => this.loadData(false)}
                            tintColor={theme.themeColor}
                        />
                    }

                    ListFooterComponent={() => this.genIndicator()}
                    onEndReached={() => {
                        setTimeout(() => {
                            if (this.canLoadMore) {
                                this.loadData(true);
                                this.canLoadMore = false
                            }
                        },100);
                    }}
                    onEndReachedThreshold={0.2}
                    onMomentumScrollBegin={() => {
                        this.canLoadMore = true;
                    }}
                />
                <Toast ref={'toast'}
                position={'center'}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    popular: state.popular,
});

const mapDispatchToProps = dispatch => ({
    onRefreshPopular: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onRefreshPopular(storeName,url,pageSize,favoriteDao)),
    onLoadMorePopular: (storeName, pageIndex, pageSize, items, callback,favoriteDao) => dispatch(actions.onLoadMorePopular(storeName,pageIndex,pageSize,items,callback,favoriteDao)),
    onFlushPopularFavorite: (storeName, pageIndex, pageSize, items, favoriteDao) => dispatch(actions.onFlushPopularFavorite(storeName,pageIndex,pageSize,items,favoriteDao))
});

const PopularTabPage = connect(mapStateToProps,mapDispatchToProps)(PopularTab);

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
    tabStyle: {
        // minWidth: 50,
        padding: 0,
    },
    indicatorStyle: {
        height: 2,
        backgroundColor: 'white',
    },
    labelStyle: {
        fontSize: 13,
        margin: 0,
    },
    indicatorContainer: {
        alignItems: 'center',
    },
    indicator: {
        color: 'red',
        margin: 10,
    }
});