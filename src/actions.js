import {
    graphql,
    formatQuery,
    formatMutation,
} from "@openimis/fe-core";

export function fetchCaches() {
    var projections = [
        "maxItemCount",
        "totalCount",
        "edges { node { model cacheName totalCount maxItemCount}}",
    ];
    const payload = formatQuery("cacheInfo",'', projections);
    return graphql(payload, "CACHE_CACHES");
}

export function clearCaches(models, clientMutationLabel) {
    let mutation = formatMutation(
        "clearCache",
        `models: ["${models.join('","')}"]`,
        clientMutationLabel,
    );
    var requestedDateTime = new Date();
    return graphql(mutation.payload, ["CACHE_MUTATION_REQ", "CACHE_DELETE_RESP", "CACHE_MUTATION_ERR"], {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime,
    });
}