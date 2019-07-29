/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import NavigationUtil from '../navigator/NavigationUtil';
import DynamicTabNavigator from '../navigator/DynamicTabNavigator';
import {View} from 'react-native';
import {NavigationActions} from 'react-navigation';
import {connect} from "react-redux";
import BackPressComponent from "../common/component/BackPressComponent";
import CustomThemeDialog from "../common/component/CustomThemeDialog";
import actions from "../action";

type Props = {};

class HomePage extends Component<Props> {
    constructor(props) {
        super(props);
        this.backPress = new BackPressComponent({backPress: this.onBackPress()});
        const {onThemeInit} = this.props;
        onThemeInit();
    }

    componentDidMount() {
        this.backPress.componentDidMount();
    }

    componentWillMount() {
        this.backPress.componentWillUnmount();
    }

    //处理Android中的物理返回键
    onBackPress = () => {
        const {dispatch, nav} = this.props;
        if (nav.routes[1].index === 0) {
            return false;
        }
        dispatch(NavigationActions.back());
        return true;
    };

    renderCustomThemeView() {
        const {customThemeViewVisible, onShowCustomThemeView} = this.props;
        return (<CustomThemeDialog
            visible={customThemeViewVisible}
            {...this.props}
            onClose={() => onShowCustomThemeView(false)}
        />)
    }

    render() {
        NavigationUtil.navigation = this.props.navigation;
        return <View style={{flex: 1}}>
            <DynamicTabNavigator/>
            {this.renderCustomThemeView()}
        </View>;
    }
}

const mapStateToProps = state => ({
    nav: state.nav,
    customThemeViewVisible: state.theme.customThemeViewVisible,
});
const mapDispatchToProps = dispatch => ({
    onShowCustomThemeView: (show) => dispatch(actions.onShowCustomThemeView(show)),
    onThemeInit: () => dispatch(actions.onThemeInit())
});
export default connect(mapStateToProps,mapDispatchToProps)(HomePage)
