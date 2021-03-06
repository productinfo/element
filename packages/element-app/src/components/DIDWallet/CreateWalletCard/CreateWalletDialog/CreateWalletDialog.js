import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import QRCode from 'qrcode.react';

import element from '@transmute/element-lib';
import didWallet from '@transmute/did-wallet';

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

class CreateWalletDialog extends React.Component {
  state = {
    open: false,
    password: '',
    confirm: '',
    ciphered: '',
  };

  handleClose = () => {
    this.setState({ password: '' });
    this.props.onClose();
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
      password: '',
      confirm: '',
      ciphered: '',
    });
    const keys = element.func.createKeys();
    const wallet = didWallet.create({
      keys: [
        {
          type: 'assymetric',
          encoding: 'hex',
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
          tags: ['Secp256k1VerificationKey2018', 'WebBrowser'],
          notes: '',
        },
      ],
    });

    this.wallet = wallet;
  }

  handleChange = name => (event) => {
    this.setState({ [name]: event.target.value });
  };

  exportWallet = () => {
    this.wallet.lock(this.state.password);
    this.setState({
      ciphered: this.wallet.ciphered,
    });
    download('wallet.txt', this.wallet.ciphered);
  };

  render() {
    const { password, confirm, ciphered } = this.state;
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Create A DID Wallet</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter a password to protect your wallet.</DialogContentText>
            <br />
            <TextField
              autoFocus
              margin="dense"
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={this.handleChange('password')}
              fullWidth
            />
            <br />
            <TextField
              margin="dense"
              id="confirm"
              label="Confirm Password"
              type="password"
              value={confirm}
              disabled={!password}
              onChange={this.handleChange('confirm')}
              fullWidth
            />

            {ciphered !== '' && (
              <QRCode value={ciphered} style={{ width: '100%', height: '100%' }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={this.exportWallet}
              color="primary"
              variant="contained"
              disabled={password !== confirm}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateWalletDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default CreateWalletDialog;
