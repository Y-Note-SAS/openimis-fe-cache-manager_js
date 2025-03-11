
import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip } from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import {
    formatMessageWithValues,
    withModulesManager,
    Searcher,
    formatMessage,
    journalize
} from "@openimis/fe-core";

import { clearCaches, fetchCaches } from "../actions";
import cacheFilter from "./CacheFilter";
import ClearCacheDialog from "./ClearCacheDialog";

const CACHE_SEARCHER_CONTRIBUTION_KEY = "cache.CacheSearcher";

const styles = theme => ({
    page: theme.page,
});

class CacheSearcher extends Component {

    state = {
        deletedCacheModel: null,
        params: {},
        reset: 0,
        initialFitlers: this.props.defaultFilters
    };

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = [10, 20, 50, 100];
        this.defaultPageSize = 20;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        }
    }

    fetch = (params) => {
        this.setState({ params });
        this.props.fetchCaches(params);
    };

    headers = () => {
        var result = [
            "cacheSummaries.model",
            "cacheSummaries.name"
        ];
        return result;
    };

    filtersToQueryParams = (state) => {
        const prms = Object.keys(state.filters)
            .filter((contrib) => !!state.filters[contrib].filter)
            .map((contrib) => state.filters[contrib].filter);
        return prms;
    };

    clearCaches = () => {
        const model = this.state.deletedCacheModel;
        this.setState({ deletedCacheModel: null }, async (e) => {
            this.props.clearCaches(
                model,
                formatMessageWithValues(this.props.intl, "cache", "deleteDialog.title", { model: model }),
            ).then(() => {
                let parm = this.filtersToQueryParams(this.state)
                this.fetch(parm);
            });
        });
    };

    confirmDelete = () => {
        let filter = this.state.filters || this.props.defaultFilters;
        this.setState({ deletedCacheModel: filter[`model`][`value`] });
    };

    itemFormatters = () => {
        var result = [
            (c) => c.model,
            (c) => c.cacheName
        ]
        return result;
    };

    onFiltersApplied = (filters) => {
        let filt = [];
        filt.push(filters.model.filter);
        this.setState({
            filters,
            params: filters.model.filter
        });
        this.props.fetchCaches(filt)
    };

    canDeleteCaches = (selection) => !!this.props.cachesPageInfo && this.props.cachesPageInfo.totalCount != 0;

    deleteCaches = () => {
        this.confirmDelete();
    };

    render() {
        const {
            intl,
            caches,
            fetchingCaches,
            fetchedCaches,
            errorCaches,
            cachesPageInfo,
            defaultFilters,
        } = this.props
        var count = !!cachesPageInfo && cachesPageInfo.totalCount;
        let actions = [];
        actions.push({
            label: formatMessage(intl, "cache", "cacheSummaries.delete"),
            enabled: this.canDeleteCaches,
            action: this.deleteCaches,
        });

        return (
            <>
                <ClearCacheDialog
                    model={this.state.deletedCacheModel}
                    onConfirm={this.clearCaches}
                    onCancel={(e) => this.setState({ deletedCacheModel: null })}
                />
                <Searcher
                    module="cache"
                    fetchingItems={fetchingCaches}
                    fetchedItems={fetchedCaches}
                    itemsPageInfo={cachesPageInfo}
                    items={caches}
                    FilterPane={cacheFilter}
                    contributionKey={CACHE_SEARCHER_CONTRIBUTION_KEY}
                    errorItems={errorCaches}
                    tableTitle={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    fetch={this.fetch}
                    canFetch={false}
                    defaultFilters={defaultFilters}
                    actions={actions}
                    filtersToQueryParams={this.filtersToQueryParams}
                    onChangeFilters={this.onFiltersApplied}
                />
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    caches: state.cache.caches,
    fetchingCaches: state.cache.fetchingCaches,
    fetchedCaches: state.cache.fetchedCaches,
    errorCaches: state.cache.errorCaches,
    cachesPageInfo: state.cache.cachesPageInfo,
    submittingMutation: state.cache.submittingMutation,
    mutation: state.cache.mutation,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchCaches, clearCaches, journalize }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);