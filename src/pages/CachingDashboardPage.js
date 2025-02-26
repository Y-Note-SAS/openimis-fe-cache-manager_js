
import React, { Component, Fragment, useState } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { Searcher } from "@openimis/fe-core";
import DeleteIcon from "@material-ui/icons/Delete";
import { connect } from "react-redux";
import { IconButton, Grid } from "@material-ui/core"
import {
    formatMessageWithValues,
    Table,
    formatMessage,
    withModulesManager,
    TextInput
} from "@openimis/fe-core";

import { clearCaches } from "../actions";

const styles = theme => ({
    page: theme.page,
});

class CachingDashboardPage extends Component {
    state = {
        elements: [],
    };

    _onDelete = (key) => {

    };

    getCachedData = async () => {

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
        const {
            intl,
            classes,
            caches,
        } = this.props
        var count = this.state.elements.length;
        console.log(caches)

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
            (i) => <Grid item xs={8} className={classes.item}>{i.value}</Grid>
        ];

        return (
            <div className={classes.page}>
                <Table
                    module="cache"
                    header={formatMessageWithValues(intl, "cache", "cacheSummaries", { count })}
                    headers={headers}
                    itemFormatters={itemFormatters}
                    items={caches}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    caches: !!state.cache ? state.cache.caches : [],
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearCaches }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CachingDashboardPage)))));