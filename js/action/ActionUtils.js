import ProjectModel from "../model/ProjectModel";
import Utils from "../utils/Utils";

/**
 * 处理数据
 * @param acitonType
 * @param dispatch
 * @param storeName
 * @param data
 * @param pageSize
 * @param params
 */
export function handleData(actionType, dispatch, storeName, data, pageSize, favoriteDao, params) {
    let fixItems = [];
    if (data && data.data) {
        if (Array.isArray(data.data)) {
            fixItems = data.data;
        } else if (Array.isArray(data.data.items)) {
            fixItems = data.data.items;
        }
    }
    //第一次要加载的数据
    let showItems = pageSize > fixItems.length ? fixItems : fixItems.slice(0, pageSize)
    _projectModels(showItems, favoriteDao, projectModels => {
        dispatch({
            type: actionType,
            items: fixItems,
            projectModels: projectModels,
            storeName,
            pageIndex: 1,
            ...params
        })
    });
}

/**
 * 通过本地的收藏状态包装Item
 * @param showItems
 * @param favoriteDao
 * @param callback
 * @return {Promise<void>}
 * @private
 */
export async function _projectModels(showItems, favoriteDao, callback) {
    let keys = [];
    try {
        //获取收藏的key
        keys = await favoriteDao.getFavoriteKeys();
    } catch (e) {
        console.log(e);
    }

    let projectModels = [];
    for (let i = 0, len = showItems.length; i < len; i++) {
        projectModels.push(new ProjectModel(showItems[i], Utils.checkFavorite(showItems[i], keys)));
    }
    doCallBack(callback,projectModels);
}

export const doCallBack = (callback, object) => {
    if (typeof callback === 'function') {
        callback(object);
    }
};