import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    withHistory,
    withModulesManager,
    formatMessage,
    Helmet,
} from "@openimis/fe-core";
import CacheSearcher from "../components/CacheSearcher";

const styles = (theme) => ({
    page: theme.page,
    fab: theme.fab,
});

class CachesPage extends Component {
    constructor(props) {
        super(props);
        let defaultFilters = props.modulesManager.getConf("fe-cache", "defaultFilters", {
            "model": {
                "value": "location",
                "filter": `model: "location"`,
            },
        });
        this.state = {
            defaultFilters,
        };
    }

    render() {
        const { intl, classes, filters } = this.props;
        return (
            <div className={classes.page}>
                <Helmet title={formatMessage(intl, "cache", "caches.page.title")} />
                <CacheSearcher
                    defaultFilters={this.state.defaultFilters}
                />
            </div>
        );
    }
}

export default injectIntl(
    withModulesManager(
        withHistory(withTheme(withStyles(styles)(CachesPage))),
    ),
);