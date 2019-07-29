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
import TrendingItem from "../common/component/item/TrendingItem";
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";

const URL = "https://api.github.com/search/repositories?q=";
const QUERY_STR = "&sort=stars";
const pageSize = 10;
const favoriteDao = new FavoriteDao(FLAG_STORE.flag_popular);

type Props = {};
class FavoritePage extends Component<Props> {
    constructor(props) {
        super(props);
        this.tabNames=['最热', '趋势'];
    }

    render() {
        const {theme} = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: 'light-content',
        };
        let navigationBar = <NavigationBar
            title={'最热'}
            statusBar={statusBar}
            style={theme.styles.navBar}
        />;
        const TabNavigator = createAppContainer(createMaterialTopTabNavigator({
            'Popular': {
                screen: props => <FavoriteTabPage {...props} flag={FLAG_STORE.flag_popular} theme={theme}/>,
                navigationOptions: {
                    title: this.tabNames[0],
                },
            },
            'Trending': {
                screen: props => <FavoriteTabPage {...props} flag={FLAG_STORE.flag_trending} theme={theme}/>,
                navigationOptions: {
                    title: this.tabNames[1],
                }
            }
        },{
            tabBarOptions: {
                tabStyle: styles.tabStyle,
                upperCaseLabel: false,
                style: {
                    backgroundColor: theme.themeColor,
                    height: 30,
                },
                indicatorStyle: styles.indicatorStyle,
                labelStyle: styles.labelStyle,
            }
        }));
        return <View style={{flex: 1, marginTop: 30}}>
            {navigationBar}
            <TabNavigator/>
        </View>;
    }
}

const mapPopularStateToProps = state => ({
    theme: state.theme.theme,
});

const mapPopularDispatchToProps = dispatch => ({
});

export default connect(mapPopularStateToProps,mapPopularDispatchToProps)(FavoritePage);

class FavoriteTab extends Component<Props> {
    constructor(props) {
        super(props);
        const {flag} = this.props;
        this.storeName = flag;
        this.favoriteDao = new FavoriteDao(flag);
    }

    componentDidMount() {
        this.loadData(false);
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.listener = data => {
            if (data.to === 2) {
                this.loadData(false);
            }
        })
    }

    componentWillUnmount() {
        EventBus.getInstance().removeListener(this.listener);
    }

    loadData(isShowLoading) {
        const {onLoadFavoriteData} = this.props;
        onLoadFavoriteData(this.storeName, isShowLoading);
    }

    /**
     * 获取与当前页面有关的数据
     * @private
     */
    _store() {
        const {favorite} = this.props;
        let store = favorite[this.storeName];
        if (!store) {
            store = {
                items: [],
                isLoading: false,
                projectModels: [], //要显示的数据
            }
        }
        return store;
    }

    renderItem(data) {
        const item = data.item;
        const Item = this.storeName === FLAG_STORE.flag_popular ? PopularItem : TrendingItem;
        const {theme} = this.props;
        return <Item
            theme={theme}
            projectModel={item}
            onSelect={(callback) => {
                NavigationUtil.goPage({
                    theme,
                    projectModel: item,
                    flag: this.storeName,
                    callback,
                }, 'DetailPage');
            }}
            onFavorite={(item, isFavorite) => this.onFavorite(item, isFavorite)}
        />
    }

    onFavorite(item, isFavorite) {
        FavoriteUtils.onFavorite(this.favoriteDao,item,isFavorite,this.props.flag);
        if (this.storeName === FLAG_STORE.flag_popular) {
            EventBus.getInstance().fireEvent(EventTypes.favorite_changed_popular);
        } else {
            EventBus.getInstance().fireEvent(EventTypes.favorite_changed_trending);
        }
    }

    render() {
        let store = this._store();
        const {theme} = this.props;
        return (
            <View style={styles.container}>
                <FlatList
                    data={store.projectModels}
                    renderItem={data => this.renderItem(data)}
                    keyExtractor={item => "" + (item.item.id || item.item.fullName)}
                    refreshControl={
                        <RefreshControl
                            title={"Loading"}
                            titleColor={theme.themeColor}
                            colors={[theme.themeColor]}
                            refreshing={store.isLoading}
                            onRefresh={() => this.loadData(true)}
                            tintColor={theme.themeColor}
                        />
                    }
                />
                <Toast ref={'toast'}
                       position={'center'}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    favorite: state.favorite,
});

const mapDispatchToProps = dispatch => ({
    onLoadFavoriteData: (storeName, isShowLoading) => dispatch(actions.onLoadFavoriteData(storeName, isShowLoading))
});

const FavoriteTabPage = connect(mapStateToProps,mapDispatchToProps)(FavoriteTab);

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