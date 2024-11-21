import React, { Component } from "react";
import {
  DataUsage,
  Dashboard,
} from "@material-ui/icons";
import {
  formatMessage,
  MainMenuContribution,
  withModulesManager,
  ErrorBoundary,
} from "@openimis/fe-core";
import { injectIntl } from 'react-intl';

class CacheMainMenu extends Component {
  render() {
    const { rigths } = this.props;
    console.log('props',this.props)

    let entries = [];
    entries.push({
      text: formatMessage(this.props.intl, "cache", "menu.cachedashboard"),
      icon: <DataUsage />,
      route: "/cache_dashboard/dashboard",
    });

    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "cache", "mainMenu")}
        icon={Dashboard}
        entries={entries}
      />
    );
  }
}
export default withModulesManager(injectIntl(CacheMainMenu));
