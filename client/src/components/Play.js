import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import { inspect } from 'util'
import ekods from '../../../core/index'

export default class Play extends Component{

  constructor(props) {
    super(props) 
    this.state = {
      graphStr: '',
      pathStr: '',
      routeStr: {
        from: '',
        to: ''
      },
      graph: ekods.commons.InvalidGraph(),
      path: [],
      pathRoutes: [],
      routes: [],
      cheapest: [],
      options: {
        maxSteps: Infinity,
        maxCost: Infinity,
        routeOnce: false
      }
    }
  }

  updateGraph(graphStr) {
    const graph = ekods.parseGraph(graphStr)
    this.setState({ graphStr, graph })
    setTimeout(() => {
      this.updatePath()
      this.updateRoute()
    }, 150)
  }

  updatePath(pathStr = this.state.pathStr) {
    const { graph } = this.state
    const path = ekods.parsePath(pathStr)
    const pathRoutes = ekods.findPathRoutes(graph)(path)
    this.setState({ pathStr, path, pathRoutes })
  }

  updateRoute(d, str) {
    const { graph, routeStr, options } = this.state
    const from = d ==='from' ? str : routeStr.from
    const to = d ==='to' ? str : routeStr.to
    const routes = ekods.findRoutes(graph, from, to, options)
    const cheapest = ekods.cheapestRoute(routes)
    this.setState({ routeStr: { from, to }, routes, cheapest })
  }

  updateOption(d, value) {
    const { graph, routeStr } = this.state
    const options = {
      ...this.state.options,
      [d]: d === 'routeOnce' ? value : Number(value)
    }
    const routes = ekods.findRoutes(graph, routeStr.from, routeStr.to, options)
    const cheapest = ekods.cheapestRoute(routes)
    this.setState({ options, routes, cheapest })
  } 

  renderResult(result) {
    return inspect(result, { depth: null, compact: false })
  }

  render() {
    const { graphStr, graph, pathStr, routeStr,
      path, pathRoutes, routes, cheapest, options } = this.state
    const handleGraphChange = ({ target }) => this.updateGraph(target.value)
    const handlePathChange = ({ target }) => this.updatePath(target.value)
    const handleRouteChange = d => ({ target }) => this.updateRoute(d, target.value)
    const handleMaxStepsChange = ({ target }) => this.updateOption('maxSteps', target.value)
    const handleMaxCostChange = ({ target }) => this.updateOption('maxCost', target.value)
    const handleRouteOnceChange = ({ target }) => this.updateOption('routeOnce', target.checked)
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <label>Working graph:</label>
            <input type='text' className='form-control' value={graphStr} onChange={handleGraphChange}/>
            <pre style={{minHeight:'200px'}}>{this.renderResult(graph)}</pre>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <label>Look for a path (e.g. 'A-B-C'):</label>
            <input type='text' className='form-control' value={pathStr} onChange={handlePathChange}/>
            <label>Path:</label><pre>{this.renderResult(path)}</pre>
            <label>Routes:</label><pre>{this.renderResult(pathRoutes)}</pre>
          </Col>
          <Col xs={6}>
            <label>Look for a route (e.g. from 'A' to 'D'):</label>
            <input type='text' className='form-control' value={routeStr.from}
              onChange={handleRouteChange('from')}/>
            <input type='text' className='form-control' value={routeStr.to} 
              onChange={handleRouteChange('to')}/>
            <label>Max steps:</label><input type='text' className='form-control' value={options.maxSteps} 
              onChange={handleMaxStepsChange}/>
            <label>Max cost:</label><input type='text' className='form-control' value={options.maxCost} 
              onChange={handleMaxCostChange}/>
            <label>Route once:</label><input type='checkbox' checked={options.routeOnce ? true : false} 
              onChange={handleRouteOnceChange}/><br/>
            <label>Routes:</label><pre>{this.renderResult(routes)}</pre>
            <label>Cheapest route:</label><pre>{this.renderResult(cheapest)}</pre>
          </Col>
        </Row>         
      </Grid>
    )
  }

}
