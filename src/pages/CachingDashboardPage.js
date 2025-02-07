
import React, { Component, Fragment, useState } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Searcher } from "@openimis/fe-core";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton, Grid } from "@material-ui/core"
import {
    formatMessageWithValues,
    Table,
    formatMessage,
    withModulesManager,
    TextInput
} from "@openimis/fe-core";

const styles = theme => ({
    page: theme.page,
});

class CachingDashboardPage extends Component {
    state = {
        elements: [],
    };

    _onDelete = (key) => {
    };

    _getdata = () => {

        // for (const key of keys) {
        //     //data.push(key);
        //     // const isOurCache = key.startsWith("myapp-");
        //     // if (currentCache === key || !isOurCache) {
        //     //     continue;
        //     // }
        //     // caches.delete(key);
        // }
    }

    initData = () => {
        this._getdata();
        let data = [];
        var localKeys = Object.keys(localStorage);
        var sessionKeys = Object.keys(sessionStorage);
        var i = localKeys.length;
        var j = sessionKeys.length;
        console.log(localStorage)
        console.log(sessionStorage)

        while (i--) {
            data.push(localKeys[i]);
        }
        while (j--) {
            data.push(sessionKeys[j]);
        }

        if ('caches' in window) {
            caches.open('localhost').then(function(cache) {
                console.log(cache);
              }).catch(function(error) {
                // Failed to open cache
              });
        }
        return data;
    };

    componentDidMount() {
        this.setState({ elements: this.initData() });
    }

    render() {
        const { intl, classes } = this.props

        var count = this.state.elements.length;

        let headers = [
            "cacheSummaries.key",
            "cacheSummaries.description"
        ]

        let itemFormatters = [
            (i) => (
                <Grid item xs={4} className={classes.item}>
                    {i}
                </Grid>
            ),
            (i) => <Grid item xs={8} className={classes.item}>{localStorage.getItem(i)}</Grid>,
            (i) => (
                <IconButton onClick={(e) => this._onDelete(i)}>
                    <DeleteIcon />
                </IconButton>
            )
        ];

        return (
            <div className={classes.page}>
                <Table
                    module="cache"
                    header={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                    headers={headers}
                    itemFormatters={itemFormatters}
                    items={this.state.elements}
                />
            </div>


        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(CachingDashboardPage))));