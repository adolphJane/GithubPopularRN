import Types from '../../action/types';

const defaultState = {
    theme: 'blue',
};

/**
 * favorite: {
 *     popular:{
 *         projectModels:[],
 *         isLoading: false
 *     },
 *     trending:{
 *         projectModels:[],
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
        case Types.FAVORITE_LOAD_SUCCESS:
            //下拉刷新成功
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    projectModels: action.projectModels,  //此次要展示的数据
                    isLoading: false,
                },
            };
        case Types.FAVORITE_LOAD_DATA:
            //下拉刷新
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: true,
                }
            };
        case Types.FAVORITE_LOAD_FAIL:
            //下拉刷新失败
            return {
                ...state,
                [action.storeName]: {
                    ...state[action.storeName],
                    isLoading: false,
                }
            };
        default:
            return state;
    }
}