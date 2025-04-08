
import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip, Grid, Button } from "@material-ui/core";
import WhatshotIcon from "@material-ui/icons/Whatshot";
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

import { clearCaches, fetchCaches, preheatCache } from "../actions";

import { CACHE_MODEL } from "../constants";

const styles = theme => ({
    page: theme.page,
    primaryButton: theme.dialog.primaryButton,
    secondaryButton: theme.dialog.secondaryButton,
});

class CacheSearcher extends Component {

    constructor(props) {
        super(props);

        this.state = {
            deleteModel: null,
            totalStorage: []
        }
    }

    filtersToQueryParams = (state) => {
        let prms = Object.keys(state.filters)
            .filter((f) => !!state.filters[f]["filter"])
            .map((f) => state.filters[f]["filter"]);
        let forced = this.forcedFilters();
        let random = state.filters["random"];
        if (forced.length > 0) {
            prms.push(...forced.map((f) => f.filter));
        }
        if (!!random) {
            prms.push(`first: ${random.value}`);
            prms.push(`orderBy: ["dateClaimed", "?"]`);
            this.setState({ random });
        } else {
            //prms.push(`orderBy: ["${state.orderBy}"]`);
            this.setState({ random: null });
        }
        if (!forced.length && !random) {
            if (!state.beforeCursor && !state.afterCursor) {
                prms.push(`first: ${state.pageSize}`);
            }
            if (!!state.afterCursor) {
                prms.push(`after: "${state.afterCursor}"`);
                prms.push(`first: ${state.pageSize}`);
            }
            if (!!state.beforeCursor) {
                prms.push(`before: "${state.beforeCursor}"`);
                prms.push(`last: ${state.pageSize}`);
            }
        }
        return prms;
    };

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
    fetch = (prms) => {
        this.props.fetchCaches(prms)
    };

    preheatCacheFetch = (model) => {
        this.props.preheatCache(model, formatMessageWithValues(this.props.intl, "cache", "preheatCache.text", { model: model }),);
    }


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
    forcedFilters() {
        return !this.props.forcedFilters ? [] : [...this.props.forcedFilters.filter((f) => f.id !== "random")];
    }

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



    itemFormatters = (classes) => {
        var result = [
            (c) => <Grid item xs={3}>{c.cacheName}</Grid>,
            (c) => <Grid item xs={4}>{c.totalCount}</Grid>,
            (c) => <Grid item xs={4}>{c.maxItemCount}</Grid>,
            (c) =>
                <Grid item xs={4}>
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
                                            top: 20,
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
                            } />) : null}</Grid>,
            (c) => 
                <Grid item xs={5}>{
                c.maxItemCount > 0 ? (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<WhatshotIcon />}
                    onClick={() => this.preheatCacheFetch(c.cacheName)}
                >
                    {formatMessage(this.props.intl, "cache", "preheatCache.button.title")}
                </Button>) : null
            } </Grid>

        ]
        return result;
    };
    rowIdentifier = (r) => r.model;


    render() {
        const {
            intl,
            classes,
            errorCaches,
            fetchingCaches,
            fetchedCaches,
            cachesPageInfo,
            caches,
            actions
        } = this.props
        let count = caches.length
        return (
            <Searcher
                module="cache"
                fetchingItems={fetchingCaches}
                fetchedItems={fetchedCaches}
                itemsPageInfo={cachesPageInfo}
                items={caches}
                actions={actions}
                errorItems={errorCaches}
                filtersToQueryParams={this.filtersToQueryParams}
                tableTitle={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                headers={this.headers}
                withSelection="multiple"
                itemFormatters={this.itemFormatters}
                fetch={this.fetch}
                canFetch={false}
                rowIdentifier={this.rowIdentifier}
            />

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
    totalCacheModel: state.cache.totalCacheModel,
    preheatingCache: state.cache.preheatingCache,
    preheatedCache: state.cache.preheatedCache,
    errorPreheatCache: state.cache.errorPreheatCache,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchCaches, clearCaches, preheatCache, journalize }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CacheSearcher))))
);