import Types from '../types'
import DataStore, {FLAG_STORE} from '../../common/dao/DataStore'
import {_projectModels, doCallBack, handleData} from '../ActionUtils';
import Utils from "../../utils/Utils";

const API_URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=stars';
const CANCEL_TOKENS = [];

/**
 * 发起搜索
 * @param inputKey 搜索key
 * @param pageSize
 * @param token 与该搜索关联的唯一token
 * @param favoriteDao
 * @param popularKeys
 * @param callBack
 * @returns {function(*=)}
 */
export function onSearch(inputKey, pageSize, token, favoriteDao, popularKeys, callBack) {
    return dispath => {
        dispath({type: Types.SEARCH_REFRESH});
        fetch(genFetchUrl(inputKey))
            .then(response => {
                //如果任务取消，则不做任何处理
                return hasCancel(token) ? null : response.json();
            })
            .then(responseData => {
                if (hasCancel(token,true)) {
                    console.log('user cancel');
                    return;
                }
                if (!responseData || !responseData.items || responseData.items.length === 0) {
                    dispath({type: Types.SEARCH_FAIL, message: `没找到关于${inputKey}的项目`});
                    doCallBack(callBack, `没找到关于${inputKey}的项目`)
                    return;
                }
                let items = responseData.items;
                handleData(Types.SEARCH_REFRESH_SUCCESS, dispath, "",{data: items},pageSize, favoriteDao,{
                    showBottomButton: !checkKeyIsExist(popularKeys, inputKey),
                    inputKey,
                });
        }).catch(e => {
            console.log(e);
            dispath({type: Types.SEARCH_FAIL, error: e});
        })
    }
}

/**
 * 取消一个异步任务
 * @param token
 */
export function onSearchCancel(token) {
    return dispatch => {
        CANCEL_TOKENS.push(token);
        dispatch({type: Types.SEARCH_CANCEL});
    }
}

/**
 * 加载更多
 * @param pageIndex 第几页
 * @param pageSize 每页展示条数
 * @param dataArray 原始数据
 * @param favoriteDao
 * @param callBack 回调函数，可以通过回调函数来向调用页面通信：比如异常信息的展示，没有更多等待
 * @returns {function(*)}
 */
export function onLoadMoreSearch(pageIndex, pageSize, dataArray = [], favoriteDao, callBack) {
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
                    pageIndex: pageIndex - 1,
                })
            } else {
                //本次和载入的最大数量
                let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex;
                _projectModels(dataArray.slice(0, max), favoriteDao, data=>{
                    dispatch({
                        type: Types.POPULAR_LOAD_MORE_SUCCESS,
                        projectModels: data,
                        pageIndex,
                    })
                });
            }
        },500);
    }
}

function genFetchUrl(key) {
    return API_URL + key + QUERY_STR;
}

/**
 * 检查指定token是否已经取消
 * @param token
 * @param isRemove
 * @returns {boolean}
 */
function hasCancel(token, isRemove) {
    if (CANCEL_TOKENS.includes(token)) {
        isRemove && Utils.remove(CANCEL_TOKENS, token);
        return true;
    }
    return false;
}

/**
 * 检查key是否存在于keys中
 * @param keys
 * @param key
 * @return {boolean}
 */
function checkKeyIsExist(keys, key) {
    for (let i = 0, l = keys.length; i < l; i++) {
        if (key.toLowerCase() === keys[i].name.toLowerCase()) return true;
    }
    return false;
}