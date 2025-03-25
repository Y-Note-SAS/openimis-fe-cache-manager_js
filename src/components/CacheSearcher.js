
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
        elements: [],
        fetchingElements: true,
        deleteModel: null,
        totalStorage: []
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
            this.setState({ elements: [] }, (e) => {
                this.fetch()
            });
        }
    }

    fetch = () => {
        for (var i = 0; i < CACHE_MODEL.length; i++) {
            let model = CACHE_MODEL[i];
            this.props.fetchCaches(CACHE_MODEL[i]).then((response) => {
                let elts = this.state.elements;
                let totalCount = response.payload.data.cacheInfo.totalCount;
                let maxItemCount = response.payload.data.cacheInfo.maxItemCount;
                elts.push({
                    model: model,
                    totalCount: response.payload.data.cacheInfo.totalCount,
                    totalAvailable: response.payload.data.cacheInfo.maxItemCount,
                    ratio: _.round(
                        totalCount / maxItemCount,
                        2,
                    )
                })
                this.setState({
                    elements: elts
                })
            });
        }
    };

    headers = () => {
        var result = [
            "cacheSummaries.model",
            "cacheSummaries.elements",
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
            (c) => <Grid item xs={4}>{c.model}</Grid>,
            (c) => <Grid item xs={4}>{c.totalCount}</Grid>,
            (c) => <Grid item xs={4}>{c.totalAvailable}</Grid>,
            (c) =>
                <Doughnut
                    height="20px"
                    width="350px"
                    data={
                        {
                            labels: [
                                formatMessage(this.props.intl, "cache", "space.used"), 
                                formatMessage(this.props.intl, "cache", "space.free")
                            ],
                            datasets: [
                                {
                                    data: [c.ratio * 100, 100 - (c.ratio * 100)],
                                    needleValue: c.ratio * 100,
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
                    } />,
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
    return bindActionCreators({ fetchCaches, clearCaches, journalize }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);