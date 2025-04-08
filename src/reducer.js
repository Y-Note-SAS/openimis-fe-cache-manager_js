import {
    parseData,
    pageInfo,
    formatServerError,
    formatGraphQLError,
    dispatchMutationReq,
    dispatchMutationResp,
    dispatchMutationErr,
} from "@openimis/fe-core";

function reducer(
    state = {
        fetchingCaches: false,
        fetchedCaches: false,
        errorCaches: null,
        caches: [],
        cachesPageInfo: { totalCount: 0 },
        submittingMutation: false,
        mutation: {},
        totalCacheModel: {},
        preheatingCache: false,
        preheatedCache: false,
        errorPreheatCache: null,
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
        case "PREHEAT_CACHE_MUTATION_REQ":
            return dispatchMutationReq(state, action);
        case "PREHEAT_CACHE_MUTATION_RESP":
            return dispatchMutationResp(state, "preheatCache", action);
        case "PREHEAT_CACHE_MUTATION_ERR":
            return dispatchMutationErr(state, action);

        case "CACHE_MUTATION_REQ":
            return dispatchMutationReq(state, action);
        case "CACHE_MUTATION_ERR":
            return dispatchMutationErr(state, action);
        case "CACHE_DELETE_RESP":
            return dispatchMutationResp(state, "clearCache", action);
        default:
            return state;
    }
}

export default reducer;