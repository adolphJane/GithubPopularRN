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
import TrendingItem from '../common/component/item/TrendingItem';
import Toast from 'react-native-easy-toast';
import {
    RefreshControl,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    View,
    DeviceInfo,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import TrendingDialog, {TimeSpans} from '../common/component/TrendingDialog';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import actions from '../action/index';
import NavigationUtil from "../navigator/NavigationUtil";
import FavoriteDao from "../common/dao/FavoriteDao";
import {FLAG_STORE} from "../common/dao/DataStore";
import FavoriteUtils from "../utils/FavoriteUtils";
import PopularItem from "../common/component/item/PopularItem";
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";
import {FLAG_LANGUAGE} from "../common/dao/LanguageDao";
import Utils from "../utils/Utils";

const EVENT_TYPE_TIME_SPAN_CHANGE = "EVENT_TYPE_TIME_SPAN_CHANGE";
const URL = "https://github.com/trending/";
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORE.flag_trending);

type Props = {};

class TrendingPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            timeSpan: TimeSpans[0],
        };
        const {onLoadLanguage} = this.props;
        onLoadLanguage(FLAG_LANGUAGE.flag_language);
        this.preKeys = [];
    }

    _genTabs() {
        const tabs = [];
        const {keys,theme} = this.props;
        this.preKeys = keys;
        keys.forEach((item, index) => {
            if (item.checked) {
                tabs[`tab${index}`] = {
                    screen: props => <TrendingTabPage {...props} timeSpan={this.state.timeSpan} tabLabel={item.name} theme={theme}/>,
                    navigationOptions: {
                        title: item.name
                    }
                }
            }
        });
        return tabs;
    }

    renderTitleView() {
        return <View>
            <TouchableOpacity
                underlayColor={'transparent'}
                onPress={() => this.dialog.show()}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, color: "#FFFFFF", fontWeight: '400'}}>
                        趋势 {this.state.timeSpan.showText}
                    </Text>
                    <MaterialIcons
                        name={'arrow-drop-down'}
                        size={22}
                        style={{color: 'white'}}
                    />
                </View>
            </TouchableOpacity>
        </View>
    }

    onSelectTimeSpan(tab) {
        this.dialog.dismiss();
        this.setState({
            timeSpan: tab
        });
        DeviceEventEmitter.emit(EVENT_TYPE_TIME_SPAN_CHANGE, tab);
    }

    renderTrendingDialog() {
        return <TrendingDialog
            ref={dialog => this.dialog = dialog}
            onSelect={tab => this.onSelectTimeSpan(tab)}
        />
    }

    _tabNav() {
        const {theme} = this.props;
        if (theme !== this.theme || !this.tabNav || !Utils.isEqual(this.preKeys, this.props.keys)) {
            this.theme = theme;
            this.tabNav = createAppContainer(createMaterialTopTabNavigator(this._genTabs(), {
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
            }));
        }
        return this.tabNav;
    }

    render() {
        const {keys,theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: 'light-content',
        };
        let navigationBar = <NavigationBar
            titleView={this.renderTitleView()}
            statusBar={statusBar}
            style={theme.styles.navBar}
        />;

        const TabNavigator = keys.length ? this._tabNav() : null;
        return <View style={{flex: 1, marginTop: DeviceInfo.isIPhoneX_deprected ? 30 : 0}}>
            {navigationBar}
            {TabNavigator && <TabNavigator/>}
            {this.renderTrendingDialog()}
        </View>;
    }
}

const mapPopularStateToProps = state => ({
    keys: state.language.languages,
    theme: state.theme.theme,
});

const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});

export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(TrendingPage);

class TrendingTab extends Component<Props> {
    constructor(props) {
        super(props);
        const {tabLabel, timeSpan} = this.props;
        this.storeName = tabLabel;
        this.timeSpan = timeSpan;
        this.isFavoriteChanged = false;
    }

    componentDidMount() {
        this.loadData(false);
        this.timeSpanChangeListener = DeviceEventEmitter.addListener(EVENT_TYPE_TIME_SPAN_CHANGE, (timeSpan) => {
            this.timeSpan = timeSpan;
            this.loadData(false);
        });
        EventBus.getInstance().addListener(EventTypes.favorite_changed_trending, this.favoriteChangeListener = () => {
            this.isFavoriteChanged = true;
        });

        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.bottomTabSelectListener = (data) => {
            if (data.to === 1 && this.isFavoriteChanged) {
                this.loadData(null, true);
            }
        })
    }

    componentWillUnmount() {
        if (this.timeSpanChangeListener) {
            this.timeSpanChangeListener.remove();
        }
        EventBus.getInstance().removeListener(this.favoriteChangeListener);
        EventBus.getInstance().removeListener(this.bottomTabSelectListener);
    }

    loadData(loadMore, refreshFavorite) {
        const {onRefreshTrending, onLoadMoreTrending, onFlushTrendingFavorite} = this.props;
        const store = this._store();
        const url = this.genFetchUrl(this.storeName);
        if (loadMore) {
            onLoadMoreTrending(this.storeName, ++store.pageIndex, pageSize, store.items, callback => {
                this.refs.toast.show('没有更多了');
            }, favoriteDao)
        } else if (refreshFavorite) {
            onFlushTrendingFavorite(this.storeName, store.pageIndex, pageSize, store.items, favoriteDao)
        } else {
            onRefreshTrending(this.storeName, url, pageSize, favoriteDao);
        }
    }

    /**
     * 获取与当前页面有关的数据
     * @private
     */
    _store() {
        const {trending} = this.props;
        let store = trending[this.storeName];
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
        return URL + key + "?" + this.timeSpan.searchText;
    }

    renderItem(data) {
        let item = data.item;
        const {theme} = this.props;

        return <TrendingItem
            projectModel={item}
            theme={theme}
            onSelect={(callback) => {
                NavigationUtil.goPage({
                    theme,
                    projectModel: item,
                    flag: FLAG_STORE.flag_trending,
                    callback,
                }, 'DetailPage');
            }}
            onFavorite={(item, isFavorite) => FavoriteUtils.onFavorite(favoriteDao, item, isFavorite, FLAG_STORE.flag_trending)}
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
                    keyExtractor={item => "" + (item.id || item.fullName)}
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
                        }, 100);
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
    trending: state.trending,
});

const mapDispatchToProps = dispatch => ({
    onRefreshTrending: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onRefreshTrending(storeName, url, pageSize, favoriteDao)),
    onLoadMoreTrending: (storeName, pageIndex, pageSize, items, callback, favoriteDao) => dispatch(actions.onLoadMoreTrending(storeName, pageIndex, pageSize, items, callback, favoriteDao)),
    onFlushTrendingFavorite: (storeName, pageIndex, pageSize, items, favoriteDao) => dispatch(actions.onFlushTrendingFavorite(storeName, pageIndex, pageSize, items, favoriteDao))
});

const TrendingTabPage = connect(mapStateToProps, mapDispatchToProps)(TrendingTab);

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