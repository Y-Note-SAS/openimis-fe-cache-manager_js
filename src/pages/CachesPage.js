import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { clearCaches } from "../actions";
import {
    withHistory,
    withModulesManager,
    formatMessage,
    Helmet,
    journalize,
    formatMessageWithValues
} from "@openimis/fe-core";
import CacheSearcher from "../components/CacheSearcher";
import ClearCacheDialog from "../components/ClearCacheDialog";

const styles = (theme) => ({
    page: theme.page,
    fab: theme.fab,
});

class CachesPage extends Component {
    constructor(props) {
        super(props);
        this.defaultFilters = props.modulesManager.getConf("fe-cache", "defaultFilters", {
            model: {
                value: "location",
                filter: 'model: "location"',
            },
        });
        
        this.state = {
            defaultFilters: this.defaultFilters,
            selections: [],
            open: false,
        };
    }

    openModal = (selection) => {
        this.setState({
            open: true,
            selections: selection,
        });
    };

    clearCache = () => {
        const { selections } = this.state;
        const { clearCaches, intl } = this.props;
        
        const selectedModels = selections.map(({ model }) => model);
        clearCaches(
            selectedModels,
            formatMessageWithValues(intl, "cache", "deleteDialog.title", { 
                model: selectedModels.join(", ") 
            })
        );
        
        this.setState({ open: false });
    };

    canDeleteCacheModule = (selection) => selection?.length > 0;
    
    render() {
        const { intl, classes } = this.props;
        const { defaultFilters, open, selections } = this.state;
        
        const actions = [{
            label: "cache.clearCache.emptyCache",
            action: this.openModal,
            enabled: this.canDeleteCacheModule,
        }];

        return (
            <div className={classes.page}>
                <Helmet title={formatMessage(intl, "cache", "caches.page.title")} />
                <CacheSearcher
                    defaultFilters={defaultFilters}
                    actions={actions}
                />
                <ClearCacheDialog
                    open={open}
                    onConfirm={this.clearCache}
                    onCancel={() => this.setState({ open: false })}
                    selections={selections.map(({ model }) => model)}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearCaches, journalize }, dispatch);
};

export default withModulesManager(
    connect(null, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CachesPage))))
);