import 'babel-polyfill'

import React, { Component } from 'react'
import { HashRouter } from 'react-router-dom'
import { render } from 'react-dom'
import App from './components/App'

const root = document.querySelector('#app-container')

render((
  <HashRouter hashType='noslash'>
    <App />
  </HashRouter>
), root)
