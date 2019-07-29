import {createAppContainer, createStackNavigator, createSwitchNavigator} from 'react-navigation';
import WelcomePage from '../page/WelcomePage';
import HomePage from '../page/HomePage';
import DetailPage from '../page/DetailPage';
import {connect} from 'react-redux';
import {createReactNavigationReduxMiddleware, createReduxContainer} from 'react-navigation-redux-helpers';
import WebViewPage from "../page/WebViewPage";
import AboutPage from "../page/about/AboutPage";
import AboutMePage from "../page/about/AboutMePage";
import CustomKeyPage from "../page/CustomKeyPage";
import SortKeyPage from "../page/SortKeyPage";

//设置跟路由
export const rootCom = "Init";

const InitNavigator = createStackNavigator({
    WelcomePage: {
        screen: WelcomePage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    }
});

const MainNavigator = createStackNavigator({
    HomePage: {
        screen: HomePage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    DetailPage: {
        screen: DetailPage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    WebViewPage: {
        screen: WebViewPage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    AboutPage: {
        screen: AboutPage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    AboutMePage: {
        screen: AboutMePage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    CustomKeyPage: {
        screen: CustomKeyPage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
    SortKeyPage: {
        screen: SortKeyPage,
        navigationOptions: {
            header: null,       //通过将header设为null，来禁用StackNavigator的NavigationBar
        }
    },
});

export const RootNavigator = createAppContainer(createSwitchNavigator({
    Init: InitNavigator,
    Main: MainNavigator,
}, {
    navigationOptions: {
        header: null,
    }
}));

/** * 1.初始化react-navigation与redux的中间件， * 该方法的一个很大的作用就是为
 * reduxifyNavigator的key设置actionSubscribers(行为订阅者) * 设置
 * 订阅者@https://github.com/react-navigation/react-navigation-redux-helpers/blob/master/src/middleware.js
 * #L29 * 检测订阅者是否存在@https://github.com/react-navigation/react-navigation-redux-helpers/blob/master/src/middleware.js
 * #L97 * @type {Middleware} */
export const middleware = createReactNavigationReduxMiddleware(
    state => state.nav,
'root'
);

/** * 2.将根导航器组件传递给 reduxifyNavigator 函数, * 并返回一个将navigation state
 * 和 dispatch 函数作为 props的新组件； * 注意：要在createReactNavigationReduxMiddleware之
 * 后执行 */
const AppWithNavigationState = createReduxContainer(RootNavigator, 'root');

/**
 * State到Props的映射关系
 * @param state
 * @returns {{state: NavigationState}}
 */
const mapStateToProps = state => ({
    state: state.nav,
});

export default connect(mapStateToProps)(AppWithNavigationState);