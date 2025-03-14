
import React, { Component } from "react";
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
    journalize,
} from "@openimis/fe-core";

import { clearCaches, fetchCache, fetchCacheAvailable } from "../actions";
import ClearCacheDialog from "./ClearCacheDialog";
import { CACHE_MODEL } from "../constants";

const styles = theme => ({
    page: theme.page,
});

class CacheSearcher extends Component {
    state = {
        elements: [],
        fetchingElements: true,
        deleteModel: null,
        totalStorage: []
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ elements: [] }, (e) => {
                this.fetch()
            });
        }
    }

    fetch = () => {
        for (var i = 0; i < CACHE_MODEL.length; i++) {
            let model = CACHE_MODEL[i];
            this.props.fetchCache(CACHE_MODEL[i]).then((response) => {
                let elts = this.state.elements;
                elts.push({
                    model: model,
                    totalCount: response.payload.data.cacheInfo.totalCount,
                })
                this.setState({
                    elements: elts
                })
            });
            this.props.fetchCacheAvailable(CACHE_MODEL[i])
        }
    };

    headers = () => {
        var result = [
            "cacheSummaries.model",
            "cacheSummaries.elements",
            "cacheSummaries.totalAvailable",
            "cacheSummaries.graph"
        ];
        return result;
    };

    clearCaches = () => {
        const model = this.state.deleteModel;
        if (model == null) return null;
        this.setState({ deleteModel: null }, async (e) => {
            this.props.clearCaches(
                model,
                formatMessageWithValues(this.props.intl, "cache", "deleteDialog.title", { model: model }),
            )
        });
    };

    confirmDelete = (deletedModel) => {
        this.setState({ deleteModel: deletedModel });
    };

    itemFormatters = () => {
        var result = [
            (c) => c.model,
            (c) => c.totalCount,
            (c) => !!this.props.totalCacheModel && !!this.props.totalCacheModel[`${c.model}s`] ? this.props.totalCacheModel[`${c.model}s`][`totalCount`] : 0,
            (c) => "",
            (c) => (
                <Tooltip title={formatMessage(this.props.intl, "cache", "clearCache.tooltip")}>
                    <IconButton onClick={() => this.confirmDelete(c.model)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )
        ]
        return result;
    };

    canDeleteCaches = (selection) => true;

    deleteCaches = () => {
        this.setState({ openDialog: true })
    };

    render() {
        const {
            intl,
            classes,
            errorCaches,
            fetchingCaches,
            fetchedCaches
        } = this.props
        const { elements, deleteModel } = this.state;
        let cachesPageInfo = { totalCount: elements.length }
        let count = elements.length

        return (
            <>
                <ClearCacheDialog
                    model={deleteModel}
                    onConfirm={this.clearCaches}
                    onCancel={(e) => this.setState({ deleteModel: null })}
                />
                <Searcher
                    module="cache"
                    fetchingItems={fetchingCaches}
                    fetchedItems={fetchedCaches}
                    itemsPageInfo={cachesPageInfo}
                    items={elements}
                    errorItems={errorCaches}
                    tableTitle={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    fetch={this.fetch}
                    canFetch={false}
                />
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    fetchingCaches: state.cache.fetchingCaches,
    fetchedCaches: state.cache.fetchedCaches,
    errorCaches: state.cache.errorCaches,
    cachesPageInfo: state.cache.cachesPageInfo,
    submittingMutation: state.cache.submittingMutation,
    mutation: state.cache.mutation,
    totalCacheModel: state.cache.totalCacheModel
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchCache, fetchCacheAvailable, clearCaches, journalize }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);