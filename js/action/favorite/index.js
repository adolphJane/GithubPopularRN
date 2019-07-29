import Types from '../types'
import FavoriteDao from "../../common/dao/FavoriteDao";
import ProjectModel from "../../model/ProjectModel";

/**
 * 加载收藏的项目
 * @param flag 标识
 * @param isShowLoading 是否显示loading
 * @return {{theme: *, type: string}}
 */
export function onLoadFavoriteData(flag, isShowLoading) {
    return dispath => {
        if (isShowLoading) {
            dispath({type: Types.FAVORITE_LOAD_DATA, storeName: flag});
        }
        new FavoriteDao(flag).getAllItems()
            .then(items => {
                let resultData = [];
                for (let i = 0, len = items.length; i < len; i++) {
                    resultData.push(new ProjectModel(items[i], true));
                }
                dispath({type: Types.FAVORITE_LOAD_SUCCESS, projectModels: resultData, storeName: flag});
            })
            .catch(e => {
                console.log(e);
                dispath({type: Types.FAVORITE_LOAD_FAIL, error: e, storeName: flag});
            })
    }
}