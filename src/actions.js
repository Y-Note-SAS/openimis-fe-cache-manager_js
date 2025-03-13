import {
    graphql,
    formatPageQueryWithCount,
    formatMutation,
} from "@openimis/fe-core";

export function fetchCache(model) {
    var projections = [
        "model",
        "cacheName"
    ];
    const payload = formatPageQueryWithCount("cacheInfo", [`model:"${model}"`], projections);
    return graphql(payload, "CACHE_CACHES");
}

export function fetchCacheAvailable(model) {
    var projections = [
        "totalCount",
    ];
    const payload = formatPageQueryWithCount(model, null, projections);
    return graphql(payload, "CACHE_CACHES");
}

export function selectModel(module) {
    return (dispatch) => {
        dispatch({ type: "CACHE_MODEL_SELECTED", payload: module });
    };
}

export function clearCaches(model, clientMutationLabel) {
    let mutation = formatMutation(
        "clearCache",
        `model: "${model}"`,
        clientMutationLabel,
    );
    var requestedDateTime = new Date();
    return graphql(mutation.payload, ["CACHE_MUTATION_REQ", "CACHE_DELETE_RESP", "CACHE_MUTATION_ERR"], {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime,
    });
}