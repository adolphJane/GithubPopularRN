import Types from '../types'
import ThemeDao from "../../common/dao/ThemeDao";

/**
 * 主题变更
 * @param theme
 * @return {{theme: *, type: string}}
 */
export function onThemeChange(theme) {
    return {type: Types.THEME_CHANGE, theme: theme}
}

/**
 * 初始化主题
 */
export function onThemeInit() {
    return dispatch => {
        new ThemeDao().getTheme().then((data) => {
            dispatch(onThemeChange(data))
        })
    }
}

/**
 * 显示自定义主题浮层
 * @param show
 * @return {{customThemeViewVisible: *, type: string}}
 */
export function onShowCustomThemeView(show) {
    return {type: Types.SHOW_THEME_VIEW, customThemeViewVisible: show}
}