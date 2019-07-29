/**
 * 带收藏状态的item
 * @param showText
 * @param searchText
 * @constructor
 */
export default function ProjectModel(item, isFavorite) {
    this.item = item;
    this.isFavorite = isFavorite;
}