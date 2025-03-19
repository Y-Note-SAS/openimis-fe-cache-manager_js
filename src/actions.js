import {
    graphql,
    formatQuery,
    formatMutation,
} from "@openimis/fe-core";

export function fetchCaches(model) {
    var projections = [
        "maxItemCount",
        "totalCount",
        "edges { node { model cacheName }}",
    ];
    const payload = formatQuery("cacheInfo", [`model:"${model}"`], projections);
    return graphql(payload, "CACHE_CACHES");
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