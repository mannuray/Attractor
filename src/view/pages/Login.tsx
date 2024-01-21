import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';
import { LOGIN_REQUEST, LOGOUT } from '../../model-controller/actions';
import '../../App.css';
import { i18n } from '@lingui/core'


function Login(props) {
  /*
  function act ()   {

    i18n.activate('en')
  }

  function act1 ()   {

    i18n.activate('hi')
  }
  */

  console.log('props', props)
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <div>
          <button onClick={props.login}><Trans>Login</Trans></button>
          <button onClick={props.logout}><Trans>Logout</Trans></button>
          <button onClick={props.change_lang('en')}><Trans>English</Trans></button>
          <button onClick={props.change_lang('hi')}><Trans>Hindi</Trans></button>
        </div>
        <p><Trans>status</Trans>: {props.menu}</p>
        <p><Trans>token</Trans>: {props.token || ''}</p>
      </div>
    );
  
}


const mapStateToProps = (state, ownProps) => {
  console.log('state', state)
  return {
    token: state.login.token,
    status: state.login.status,
    menu: state.menu.list
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    login: () => dispatch({type:LOGIN_REQUEST, user:'NoriSte', password:'password'}),
    logout: () => dispatch({type:LOGOUT}),

    change_lang: (lang) => i18n.activate(lang)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);