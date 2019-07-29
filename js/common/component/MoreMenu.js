import Octicons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const MoreMenu = {
    CustomLanguage: {name: '自定义语言', Icons: Ionicons, icon: 'md-checkbox-outline'},
    SortLanguage: {name: '语言排序', Icons: MaterialCommunityIcons, icon: 'sort'},
    CustomTheme: {name: '自定义主题', Icons: Ionicons, icon: 'ios-color-palette'},
    CustomKey: {name: '自定义标签', Icons: Ionicons, icon: 'md-checkbox-outline'},
    SortKey: {name: '标签排序', Icons: MaterialCommunityIcons, icon: 'sort'},
    RemoveKey: {name: '标签移除', Icons: Ionicons, icon: 'md-remove'},
    AboutAuthor: {name: '关于作者', Icons: Octicons, icon: 'smiley'},
    About: {name: '关于', Icons: Ionicons, icon: 'logo-github'},
    Tutorial: {name: '教程', Icons: Ionicons, icon: 'ios-bookmarks'},
    Feedback: {name: '反馈', Icons: MaterialIcons, icon: 'feedback'},
    Share: {name: '分享', Icons: Ionicons, icon: 'md-share'},
    CodePush: {name: 'CodePush', Icons: Ionicons, icon: 'ios-planet'},
};