import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

import { FormattedMessage } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

class ClearCacheDialog extends Component {
  state = {
    model: null,
  };

  render() {
    const { classes, open, onCancel, onConfirm, selections } = this.props;
    return (
      <Dialog open={open} onClose={onCancel}>
        <DialogTitle>
          <FormattedMessage module="cache" id={`model.deleteDialog.title`} />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage 
              module="cache" 
              id={!!selections && selections.length > 1 
                ? "cache.model.deleteDialog.messageMutipleCacheName"
                : "model.deleteDialog.message"
              }
              values={!!selections && selections.length > 1 
                ? { models: selections.join(", ") }
                : { model: selections }
              }
            />
          </DialogContentText>
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
