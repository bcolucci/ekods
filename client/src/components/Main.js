import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import Play from './Play'

class Main extends Component {

  componentDidMount() {
    if (!location.hash) {
      this.props.history.push('/#play')
    }
  }

  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/' component={Play} />
          <Route path='/play' component={Play} />
        </Switch>
      </main>
    )
  }

}

export default withRouter(Main)
