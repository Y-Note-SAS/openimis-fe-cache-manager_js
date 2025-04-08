import {
    graphql,
    formatQuery,
    formatMutation,
} from "@openimis/fe-core";

export function fetchCaches(filters) {
    var projections = [
        "totalCount",
        "pageInfo { hasNextPage hasPreviousPage startCursor endCursor }",
        "edges { node { model cacheName totalCount maxItemCount}}",
    ];
    const payload = formatQuery("cacheInfo", filters, projections);
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

export function preheatCache(model, clientMutationLabel) {
    let mutation = formatMutation(
        "preheatCache",
        `model: "${model}"`,
        clientMutationLabel,
    );
    var requestedDateTime = new Date();
    return graphql(mutation.payload, ["PREHEAT_CACHE_MUTATION_REQ", "PREHEAT_CACHE_MUTATION_RESP", "PREHEAT_CACHE_MUTATION_ERR"], {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime,
    });
}