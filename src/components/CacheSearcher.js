
import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip, Grid } from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import {
    formatMessageWithValues,
    withModulesManager,
    Searcher,
    formatMessage,
    journalize,
} from "@openimis/fe-core";
import _ from "lodash";
import { Chart, Doughnut } from "react-chartjs-2";

import { clearCaches, fetchCaches } from "../actions";
import ClearCacheDialog from "./ClearCacheDialog";
import { CACHE_MODEL } from "../constants";

const styles = theme => ({
    page: theme.page,
});

class CacheSearcher extends Component {
    state = {
        deleteModel: null,
        totalStorage: []
    }
    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf(
          "fe-cacheManager",
          "cacheSearcher.rowsPerPageOptions",
          [5, 10, 20],
        );
        this.defaultPageSize = props.modulesManager.getConf("fe-cacheManager", "cacheSearcher.defaultPageSize", 10);
      }

    componentDidMount() {
        Chart.pluginService.register({
            afterDraw: (chart) => {
                var needleValue = chart.chart.config.data.datasets[0].needleValue;
                var dataTotal = chart.chart.config.data.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                );
                var angle = Math.PI + (1 / dataTotal) * needleValue * Math.PI;
                var ctx = chart.chart.ctx;
                var cw = chart.chart.canvas.offsetWidth;
                var ch = chart.chart.canvas.offsetHeight;
                var cx = cw / 2;
                var cy = ch - 6;

                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, -3);
                ctx.lineTo(ch - 10, 0);
                ctx.lineTo(0, 3);
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fill();
                ctx.rotate(-angle);
                ctx.translate(-cx, -cy);
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);        
            this.fetch()
        }
    }
    fetch = () => {
        this.props.fetchCaches()
    };


    headers = () => {
        var result = [
            "cacheSummaries.elements",
            "cacheSummaries.totalUse",
            "cacheSummaries.totalAvailable",
            "",
            ""
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
            (c) => <Grid item xs={3}>{c.cacheName}</Grid>,
            (c) => <Grid item xs={4}>{c.totalCount}</Grid>,
            (c) => <Grid item xs={4}>{c.maxItemCount}</Grid>,
            (c) =>
                <Grid item xs={5}>
                {c.maxItemCount > 0 ? (
                <Doughnut
                    height="100%"
                    width="100%"
                    data={
                        {
                            labels: [
                                formatMessage(this.props.intl, "cache", "space.used"), 
                                formatMessage(this.props.intl, "cache", "space.free")
                            ],
                            datasets: [
                                {
                                    data: [
                                        (c.totalCount / c.maxItemCount) * 100,
                                        ((c.maxItemCount - c.totalCount) / c.maxItemCount) * 100
                                    ],
                                    needleValue: Math.max(0, c.maxItemCount === 0 ? 0 : (c.totalCount / c.maxItemCount) * 100 - 2),
                                    backgroundColor: ["lightgreen", "grey"],
                                    hoverBackgroundColor: ["lightgreen", "grey"],
                                    borderWidth: 1
                                }
                            ]
                        }
                    }
                    options={
                        {
                            layout: {
                                padding: {
                                    top: 31,
                                    bottom: 3
                                }
                            },
                            rotation: 1 * Math.PI,
                            circumference: 1 * Math.PI,
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            },
                            cutoutPercentage: 70,
                            animation: {
                                animateRotate: true,
                                animateScale: true,
                            },
                        }
                    } />) : null }</Grid>,
            (c) => (
                <Tooltip title={formatMessage(this.props.intl, "cache", "clearCache.tooltip")}>
                    <IconButton onClick={() => this.confirmDelete(c.cacheName)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )
        ]
        return result;
    };
    rowIdentifier = (r) => r.model;

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
            fetchedCaches,
            cachesPageInfo,
            caches
        } = this.props
        const { deleteModel } = this.state;
        let count = caches.length

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
                    items={caches}
                    errorItems={errorCaches}
                    tableTitle={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                    headers={this.headers}
                    withPagination={false}
                    itemFormatters={this.itemFormatters}
                    fetch={this.fetch}
                    canFetch={false}
                    rowIdentifier={this.rowIdentifier}
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
    caches: state.cache.caches,
    totalCacheModel: state.cache.totalCacheModel
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchCaches, clearCaches, journalize }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);