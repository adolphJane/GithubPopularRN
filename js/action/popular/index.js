import Types from '../types'
import DataStore, {FLAG_STORE} from '../../common/dao/DataStore'
import {_projectModels, handleData} from '../ActionUtils';
/**
 * 获取最热数据的异步Action
 * @return {{theme: *, type: string}}
 */
export function onRefreshPopular(storeName, url, pageSize, favoriteDao) {
    return dispath => {
        dispath({type: Types.POPULAR_REFRESH, storeName: storeName});
        let dataStore = new DataStore();
        //异步Action与数据流
        dataStore.fetchData(url, FLAG_STORE.flag_popular)
            .then(data => {
                handleData(Types.POPULAR_REFRESH_SUCCESS,dispath, storeName, data, pageSize, favoriteDao)
            })
            .catch(error => {
                console.log(error);
                dispath({
                    type: Types.POPULAR_REFRESH_FAIL,
                    storeName,
                    error
                })
            })
    }
}

/**
 * 加载更多
 * @param storeName
 * @param pageIndex 第几页
 * @param pageSize 每页展示条数
 * @param dataArray 原始数据
 * @param callBack  回调函数，可以通过回调函数来向调用页面通信，比如异常信息的展示，没有更多等待
 * @param favoriteDao  回调函数，可以通过回调函数来向调用页面通信，比如异常信息的展示，没有更多等待
 */
export function onLoadMorePopular(storeName, pageIndex, pageSize, dataArray = [], callback, favoriteDao) {
    return dispatch => {
        setTimeout(() => {
            if ((pageIndex - 1) * pageSize >= dataArray.length) {
                //已经加载完全部数据
                if (typeof callback === 'function') {
                    callback('no more');
                }
                dispatch({
                    type: Types.POPULAR_LOAD_MORE_FAIL,
                    error: 'no more',
                    storeName: storeName,
                    pageIndex: pageIndex - 1,
                })
            } else {
                //本次和载入的最大数量
                let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex;
                _projectModels(dataArray.slice(0, max), favoriteDao, data=>{
                    dispatch({
                        type: Types.POPULAR_LOAD_MORE_SUCCESS,
                        projectModels: data,
                        storeName,
                        pageIndex,
                    })
                });
            }
        },500);
    }
}

/**
 * 刷新收藏状态
 * @param storeName
 * @param pageIndex 第几页
 * @param pageSize  每页展示数据
 * @param dataArray 原始数据
 * @param favoriteDao
 */
export function onFlushPopularFavorite(storeName, pageIndex, pageSize, dataArray = [], favoriteDao) {
    return dispatch => {
        //本次和载入的最大数量
        let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex;
        _projectModels(dataArray.slice(0, max), favoriteDao, data=>{
            dispatch({
                type: Types.POPULAR_FLUSH_FAVORITE,
                projectModels: data,
                storeName,
                pageIndex,
            })
        });
    }
}