import React, {Component} from 'react';
import {Provider} from 'react-redux';
import AppNavigator from './navigator/AppNavigator';
import store from './store'
type Props = {};

export default class App extends Component<Props> {
    /** * 将store传递给App框架 */
    render() {
        return <Provider store={store}>
            <AppNavigator/>
        </Provider>
    }
}