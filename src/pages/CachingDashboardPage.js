
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
        // Clear all items in local storage
        //localStorage.clear();

        // Remove all saved data from sessionStorage
        //sessionStorage.clear();
    };

    getCachedData = async () => {
        // Get a list of all of the caches for this origin
        const cacheNames = await caches.keys();
        const result = [];
        console.log(cacheNames);

        for (const name of cacheNames) {
            // Open the cache
            const cache = await caches.open(name);
            console.log(cache);

            //caches.delete(name)

            // Get a list of entries. Each item is a Request object
            // for (const request of await cache.keys()) {
            //     // If the request URL matches, add the response to the result
            //     if (request.url.endsWith('.png')) {
            //         result.push(await cache.match(request));
            //     }
            // }
        }

        return result;
    }

    _getRemainingSpace = () => {
        var limit = 1024 * 1024 * 5; // 5 MB
        var totalUsed = unescape(encodeURIComponent(JSON.stringify(sessionStorage))).length + unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
        var remSpace = limit - totalUsed;

        console.log('remaining storage: ' + remSpace);
        return remSpace;
    }

    initData = () => {
        
        let data = [];
        var localKeys = Object.keys(localStorage);
        var sessionKeys = Object.keys(sessionStorage);
        var i = localKeys.length;
        var j = sessionKeys.length;
        console.log(localStorage)
        console.log(sessionStorage)

        const cacheAvailable = 'caches' in self;

        const cookieArr = document.cookie.split(';');
        console.log(cookieArr);


        while (i--) {
            data.push({ key: localKeys[i], value: localStorage.getItem(localKeys[i]) });
        }
        while (j--) {
            data.push({ key: sessionKeys[j], value: sessionStorage.getItem(sessionKeys[j]) });
        }
        console.log(data)
        return data;
    };

    componentDidMount() {
        this.setState({ elements: this.initData() });
    }

    render() {
        const { intl, classes } = this.props
        var count = this.state.elements.length;

        this.getCachedData();

        let headers = [
            "cacheSummaries.key",
            "cacheSummaries.description"
        ]

        let itemFormatters = [
            (i) => (
                <Grid item xs={4} className={classes.item}>
                    {i.key}
                </Grid>
            ),
            (i) => <Grid item xs={8} className={classes.item}>{i.value}</Grid>,
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