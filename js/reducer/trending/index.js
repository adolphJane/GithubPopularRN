import Types from '../../action/types';

const defaultState = {
    theme: 'blue',
};

/**
 * popular: {
 *     java:{
 *         items:[],
 *         isLoading: false
 *     },
 *     ios:{
 *         items:[],
 *         isLoading: false
 *     }
 * }
 * 0.state树，横向扩展
 * 1.如何动态的设置store，和动态获取store(难点: storeKey不固定)
 * @param state
 * @param action
 * @return {{theme: string}|({theme}&{theme: (string|*|{comment: string, content: string, prop: string, tag: string, value: string}|onAction)})}
 */
export default function onAction(state = defaultState, action) {
    switch (action.type) {
        case Types.TRENDING_REFRESH_SUCCESS:
            //下拉刷新成功
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    items: action.items,                //原始数据
                    projectModels: action.projectModels,  //此次要展示的数据
                    isLoading: false,
                    hideLoadingMore: false,
                    pageIndex: action.pageIndex,
                },
            };
        case Types.TRENDING_REFRESH:
            //下拉刷新
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: true,
                    hideLoadingMore: true,
                }
            };
        case Types.TRENDING_REFRESH_FAIL:
            //下拉刷新失败
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: false,
                }
            };
        case Types.TRENDING_LOAD_MORE_SUCCESS:
            //上拉加载成功
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    projectModels: action.projectModels,
                    hideLoadingMore: false,
                    pageIndex: action.pageIndex
                }
            };
        case Types.TRENDING_LOAD_MORE_FAIL:
            //上拉加载失败
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    hideLoadingMore: true,
                    pageIndex: action.pageIndex
                }
            };
        case Types.TRENDING_FLUSH_FAVORITE:
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    projectModels: action.projectModels,
                }
            };
        default:
            return state;
    }
}