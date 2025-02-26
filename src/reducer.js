import {
    parseData,
    dispatchMutationReq,
    dispatchMutationResp,
    dispatchMutationErr,
    pageInfo,
    formatServerError,
    formatGraphQLError,
} from "@openimis/fe-core";

function reducer(
    state = {
        fetchingCaches: false,
        fetchedCaches: false,
        errorCaches: null,
        caches: null,
        cachesPageInfo: { totalCount: 0 }
    },
    action
) {
    switch (action.type) {
        case "CACHE_CACHES_REQ":
            return {
                ...state,
                fetchingCaches: true,
                fetchedCaches: false,
                caches: null,
                errorCaches: null
            }
        case "CACHE_CACHES_RESP":
            return {
                ...state,
                fetchingCaches: false,
                fetchedCaches: true,
                caches: parseData(action.payload.data.cacheInfos),
                cachesPageInfo: pageInfo(action.payload.data.cacheInfos),
                errorCaches: formatGraphQLError(action.payload)
            }
        case "CACHE_CACHES_ERR":
            return {
                ...state,
                fetchingCaches: false,
                errorCaches: formatServerError(action.payload)
            }
    }
}

export default reducer;