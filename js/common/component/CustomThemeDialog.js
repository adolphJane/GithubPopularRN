import React, {Component} from 'react';
import {Modal, TouchableHighlight, StyleSheet, View, Text, DeviceInfo, ScrollView,Platform} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TimeSpan from '../../model/TimeSpan';
import ThemeDao from "../dao/ThemeDao";
import GlobalStyles from "../../res/styles/GlobalStyles";
import ThemeFactory, {ThemeFlags} from "../../res/styles/ThemeFactory";
import actions from "../../action";
import {connect} from "react-redux";

class CustomThemeDialog extends Component {
    constructor(props) {
        super(props);
        this.themeDao = new ThemeDao()
    }

    onSelectTheme(themeKey) {
        this.props.onClose();
        // const {onShowCustomThemeView} = this.props;
        // onShowCustomThemeView(false);
        this.themeDao.save(ThemeFlags[themeKey]);
        const {onThemeChange} = this.props ;
        onThemeChange(ThemeFactory.createTheme(ThemeFlags[themeKey]));
    }

    /**
     * 创建主题Item
     * @param themeKey
     */
    getThemeItem(themeKey) {
        return <TouchableHighlight
            style={{flex: 1}}
            underlayColor='white'
            onPress={() => this.onSelectTheme(themeKey)}
        >
            <View style={[{backgroundColor: ThemeFlags[themeKey]}, styles.themeItem]}>
                <Text style={styles.themeText}>{themeKey}</Text>
            </View>
        </TouchableHighlight>
    }

    renderThemeItems() {
        const views = [];
        for (let i = 0, keys = Object.keys(ThemeFlags), l = keys.length; i < l; i += 3) {
            const key1 = keys[i], key2 = keys[i + 1], key3 = keys[i + 2];
            views.push(<View key={i} style={{flexDirection: 'row'}}>
                {this.getThemeItem(key1)}
                {this.getThemeItem(key2)}
                {this.getThemeItem(key3)}
            </View>)
        }
        return views;
    }

    renderContentView() {
        return (
            <Modal
                animationType={'slide'}
                transparent={true}
                visible={this.props.visible}
                onRequestClose={() => {
                    this.props.onClose()
                }}>
                <View style={styles.modalContainer}>
                    <ScrollView>
                        {this.renderThemeItems()}
                    </ScrollView>
                </View>

            </Modal>
        )
    }

    render() {
        let view = this.props.visible ? <View style={GlobalStyles.root_container}>
            {this.renderContentView()}
        </View> : null;
        return view;
    }
}

const mapStateToProps = state => ({
    keys: state.language.keys,
});

const mapDispatchToProps = dispatch => ({
    onThemeChange: (theme) => dispatch(actions.onThemeChange(theme)),
    onShowCustomThemeView: (show) => dispatch(actions.onShowCustomThemeView(show))
});

export default connect(mapStateToProps,mapDispatchToProps)(CustomThemeDialog);

const styles = StyleSheet.create({
    themeItem: {
        flex: 1,
        height: 120,
        margin: 3,
        padding: 3,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        margin: 10,
        marginBottom: 10 + (DeviceInfo.isIPhoneX_deprecated ? 24 : 0),
        marginTop: Platform.OS === 'ios' ? 20 + (DeviceInfo.isIPhoneX_deprecated ? 24 : 0) : 10,
        backgroundColor: 'white',
        borderRadius: 3,
        shadowColor: 'gray',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 2,
        padding: 3
    },
    themeText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16
    }
});