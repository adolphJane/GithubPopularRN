import {onThemeChange,onThemeInit,onShowCustomThemeView} from './theme';
import {onRefreshPopular, onLoadMorePopular, onFlushPopularFavorite} from './popular';
import {onRefreshTrending, onLoadMoreTrending, onFlushTrendingFavorite} from './trending';
import {onLoadFavoriteData} from './favorite';
import {onLoadLanguage} from './language';
import {onLoadMoreSearch, onSearch, onSearchCancel} from './search';
export default {
    onThemeChange,
    onThemeInit,
    onShowCustomThemeView,
    onRefreshPopular,
    onLoadMorePopular,
    onFlushPopularFavorite,
    onRefreshTrending,
    onLoadMoreTrending,
    onFlushTrendingFavorite,
    onLoadFavoriteData,
    onLoadLanguage,
    onLoadMoreSearch,
    onSearch,
    onSearchCancel,
}