
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
    Searcher
} from "@openimis/fe-core";

import { clearCaches, fetchCaches } from "../actions";
import cacheFilter from "./CacheFilter";

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
                formatMessage(this.props.intl, "cache", "deleteDialog.title"),
            );
            this.fetch(this.state.params);
        });
    };

    confirmDelete = () => {
        this.setState({ deletedCacheModel: this.state.params });
    };

    deleteAction = (model) => {
        return (
            <Tooltip title={formatMessage(this.props.intl, "medical.service", "deleteService.tooltip")}>
                <IconButton onClick={() => this.confirmDelete(model)}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        );
    };

    itemFormatters = () => {
        var result = [
            (c) => c.model,
            (c) => c.cacheName
        ]
        return result;
    };

    onFiltersApplied = (filters) => {
        this.setState({
            filters,
        });
        this.props.fetchCaches(parms)
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
            actions
        } = this.props
        var count = !!cachesPageInfo && cachesPageInfo.totalCount;

        return (
            <Fragment>
                <Searcher
                    module="cache"
                    fetchingItems={fetchingCaches}
                    fetchedItems={fetchedCaches}
                    itemsPageInfo={cachesPageInfo}
                    items={caches}
                    FilterPane={cacheFilter}
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
                />
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    caches: state.cache.caches,
    fetchingCaches: state.cache.fetchingCaches,
    fetchedCaches: state.cache.fetchedCaches,
    errorCaches: state.cache.errorCaches,
    cachesPageInfo: state.cache.cachesPageInfo
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchCaches, clearCaches }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);