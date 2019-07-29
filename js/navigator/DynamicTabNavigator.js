/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {createAppContainer, createBottomTabNavigator} from 'react-navigation';
import {connect} from 'react-redux';
import {BottomTabBar} from 'react-navigation-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import PopularPage from '../page/PopularPage';
import FavoritePage from '../page/FavoritePage';
import TrendingPage from '../page/TrendingPage';
import MinePage from '../page/MinePage';
import EventBus from "react-native-event-bus";
import EventTypes from "../common/EventTypes";

type Props = {};

//在这里配置路由的页面
const TABS = {
    PopularPage: {
        screen: PopularPage,
        navigationOptions: {
            tabBarLabel: "最热",
            tabBarIcon: ({tintColor, focused}) => (
                <MaterialIcons
                    name={"whatshot"}
                    size={26}
                    style={{color: tintColor}}
                />
            ),
        }
    },
    TrendingPage: {
        screen: TrendingPage,
        navigationOptions: {
            tabBarLabel: "趋势",
            tabBarIcon: ({tintColor, focused}) => (
                <Ionicons
                    name={"md-trending-up"}
                    size={26}
                    style={{color: tintColor}}
                />
            ),
        }
    },
    FavoritePage: {
        screen: FavoritePage,
        navigationOptions: {
            tabBarLabel: "收藏",
            tabBarIcon: ({tintColor, focused}) => (
                <MaterialIcons
                    name={"favorite"}
                    size={26}
                    style={{color: tintColor}}
                />
            ),
        }
    },
    MinePage: {
        screen: MinePage,
        navigationOptions: {
            tabBarLabel: "我的",
            tabBarIcon: ({tintColor, focused}) => (
                <Entypo
                    name={"user"}
                    size={26}
                    style={{color: tintColor}}
                />
            ),
        }
    }
};

class DynamicTabNavigator extends Component<Props> {
    constructor(props) {
        super(props);
        console.disableYellowBox = true;
    }

    _tabNavigator() {
        if (this.Tabs) {
            return this.Tabs;
        }
        const {PopularPage, TrendingPage, FavoritePage, MinePage} = TABS;
        //根据需要配置显示的Tab标签
        const tabs = {PopularPage, TrendingPage, FavoritePage, MinePage};
        //动态配置Tab属性
        PopularPage.navigationOptions.tabBarLabel = '最热';
        return this.Tabs = createAppContainer(createBottomTabNavigator(tabs,{
            tabBarComponent: props => {
                return <TabBarComponent theme={this.props.theme} {...props}/>
            }
        }))
    }

    render() {
        const Tab = this._tabNavigator();
        return <Tab
            onNavigationStateChange={(prevState, newState, action) => {
                EventBus.getInstance().fireEvent(EventTypes.bottom_tab_select, {
                    //发送底部tab切换的事件
                    from: prevState.index,
                    to: newState.index,
                })
            }}
        />;
    }
}

class TabBarComponent extends Component {
    constructor(props) {
        super(props);
        this.theme = {
            tintColor: props.activeTintColor,
            updateTime: new Date().getTime(),
        }
    }

    render() {
        return <BottomTabBar
            {...this.props}
            activeTintColor = {this.props.theme.themeColor}
        />
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme,
});

export default connect(mapStateToProps)(DynamicTabNavigator);