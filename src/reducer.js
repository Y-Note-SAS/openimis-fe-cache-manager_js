import {
    parseData,
    pageInfo,
    formatServerError,
    formatGraphQLError,
} from "@openimis/fe-core";

function reducer(
    state = {
        fetchingCaches: false,
        fetchedCaches: false,
        errorCaches: null,
        caches: [],
        cachesPageInfo: { totalCount: 0 },
    },
    action
) {
    switch (action.type) {
        case "CACHE_CACHES_REQ":
            return {
                ...state,
                fetchingCaches: true,
                fetchedCaches: false,
                caches: [],
                errorCaches: null,
            };
        case "CACHE_CACHES_RESP":
            return {
                ...state,
                fetchingCaches: false,
                fetchedCaches: true,
                caches: parseData(action.payload.data.cacheInfo),
                cachesPageInfo: pageInfo(action.payload.data.cacheInfo),
                errorCaches: formatGraphQLError(action.payload)
            };
        case "CACHE_CACHES_ERR":
            return {
                ...state,
                fetchingCaches: false,
                errorCaches: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;