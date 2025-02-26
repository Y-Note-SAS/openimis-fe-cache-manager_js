import {
    graphql,
    formatQuery,
    formatPageQuery,
    formatPageQueryWithCount,
    formatJsonField,
    decodeId,
    formatMutation,
    formatGQLString,
    graphqlWithVariables,
} from "@openimis/fe-core";

export function fetchCaches(mm, filters) {
    var projections = [
        "totalCount",
        "maxItemCoun",
        "pageInfo {hasNextPage hasPreviousPage startCursor endCusor}",
        "edges { node { model cacheName }}"
    ];
    const payload = formatPageQueryWithCount("cacheInfo", filters, projections);
    return graphql(payload, "CACHE_CACHES");
}

export function clearCaches(mm, model) {
    let mutation = formatMutation(
        "clearCaches",
        `model: "${model}"`,
        clientMutationLabel,
    );
    family.clientMutationId = mutation.clientMutationId;
    var requestedDateTime = new Date();
    return graphql(mutation.payload, ["CACHE_MUTATION_REQ", "CACHE_DELETE_RESP", "CACHE_MUTATION_ERR"], {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime,
    });
}