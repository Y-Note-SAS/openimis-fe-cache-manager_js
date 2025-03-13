import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

import { FormattedMessage, PublishedComponent } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

class ClearCacheDialog extends Component {
  state = {
    model: null,
  };

  render() {
    const { classes, onChangeModel, onClick, onCancel, onConfirm } = this.props;
    return (
      <Dialog open={onClick} onClose={onCancel}>
        <DialogTitle>
          <FormattedMessage module="cache" id={`model.deleteDialog.title`} />
        </DialogTitle>
        <DialogContent>
          <PublishedComponent
            pubRef="cache.cacheModelPicker"
            value={this.state.model}
            withNull={false}
            onChange={(v, s) => onChangeModel(v)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => onConfirm()} className={classes.primaryButton} autoFocus>
            <FormattedMessage module="cache" id={`model.deleteDialog.yes.button`} />
          </Button>
          <Button onClick={onCancel} className={classes.secondaryButton}>
            <FormattedMessage module="core" id="cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(ClearCacheDialog)));
