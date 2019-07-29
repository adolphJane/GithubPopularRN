import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {ViewPropTypes, Text, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class BaseItem extends Component {
    static proTypes = {
        projectModel: PropTypes.object,
        onSelect: PropTypes.func,
        onFavorite: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isFavorite: this.props.projectModel.isFavorite,
        }
    }

    /**
     * componentWillReceiveProps在新版React中不能再用了
     * @param nextProps
     * @param prevState
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        const isFavorite = nextProps.projectModel.isFavorite;
        if (prevState.isFavorite !== isFavorite) {
            return {
                isFavorite: isFavorite,
            };
        }

        return null;
    }

    onItemClick() {
        this.props.onSelect(isFavorite => {
            this.setFavoriteState(isFavorite);
        })
    }

    setFavoriteState(isFavorite) {
        this.props.projectModel.isFavorite = isFavorite;
        this.setState({
            isFavorite: isFavorite,
        })
    }

    onPressFavorite() {
        this.setFavoriteState(!this.state.isFavorite);
        this.props.onFavorite(this.props.projectModel.item, !this.state.isFavorite)
    }

    _favoriteIcon() {
        const {theme} = this.props;
        return <TouchableOpacity
            style={{padding: 6}}
            underlayColor={'transparent'}
            onPress={() => this.onPressFavorite()}>
            <FontAwesome
                name={this.state.isFavorite ? 'star' : 'star-o'}
                size={26}
                style={{color: theme.themeColor}}
            />
        </TouchableOpacity>
    }

}