
import React, { Component, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    page: theme.page,
});

class CachingDashboardPage extends Component {
    render() {
        const {classes } = this.props 
        return (
            <div className={classes.page}>
                Test 
            </div>
        )
    }
}

export default withTheme(withStyles(styles)(CachingDashboardPage)) ;