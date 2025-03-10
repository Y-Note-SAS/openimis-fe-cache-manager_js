import React, { Component } from "react";
import _ from "lodash";
import _debounce from "lodash/debounce";
import { injectIntl } from "react-intl";

import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
    withModulesManager,
    ControlledField,
    PublishedComponent,
    ErrorBoundary,
} from "@openimis/fe-core";

const styles = (theme) => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: "0 0 10px 0",
        width: "100%",
    },
    item: {
        padding: theme.spacing(1),
    },
    paperDivider: theme.paper.divider,
});

class CacheFilter extends Component {

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-cache", "debounceTime", 200),
    );

    render() {
        const { classes, intl, filters, onChangeFilters } = this.props;
        return (
            <ErrorBoundary>
                <section className={classes.form}>
                    <Grid container>
                        <ControlledField
                            module="cache"
                            id="cacheFilter.model"
                            field={
                                <Grid item xs={2} className={classes.item}>
                                    <PublishedComponent
                                        pubRef="cache.cacheModelPicker"
                                        value={filters["model"] && filters["model"]["value"]}
                                        withNull={false}
                                        onChange={(v, s) =>
                                            this.debouncedOnChangeFilter([
                                                {
                                                    id: "model",
                                                    value: v,
                                                    filter: `model: "${v}"`,
                                                },
                                            ])
                                        }
                                    />
                                </Grid>
                            }
                        />
                    </Grid>
                </section>
            </ErrorBoundary>
        );
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(CacheFilter))));
