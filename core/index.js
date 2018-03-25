const R = require('ramda')

const dashSplit = R.split('-')
const isArray = R.is(Array)
const defInfinity = R.defaultTo(Infinity)
const isNotEmpty = R.compose(R.not, R.isEmpty)
const filterEmpty = R.filter(isNotEmpty)
const parsePath = R.compose(filterEmpty, dashSplit)
const isValidPath = R.compose(R.lt(1), R.length)
const assembleCost = R.compose(R.add(0), R.join(''))
const parseRoute = ([from, to, ...cost]) => [from, to, assembleCost(cost)]
const parseTown = R.compose(parseRoute, R.split(''), R.trim)
const noCostFree = R.filter(route => route[2] > 0)

// uniq ref for this bad scenario
const InvalidGraph = R.always({
  towns: []
})

const newTown = name => ({
  name,
  routes: {}
})

const newGraph = () => ({
  towns: {}
})

const addTownRoute = (town, [to, cost]) => ({
  ...town,
  routes: {
    ...town.routes,
    [to]: R.concat(R.clone(R.defaultTo([])(town.routes[to])), [cost])
  }
})

const mergeTowns = (towns, existing) => {
  const merger = (k, l, r) => R.ifElse(() => isArray(l), R.concat(l), R.identity)(r)
  return R.mergeDeepWithKey(merger, towns, existing)
}

const addTown = (graph, town) => ({
  ...graph,
  towns: mergeTowns({
    [town.name]: town
  }, graph.towns)
})

const createTown = R.map(([from, to, cost]) => addTownRoute(newTown(from), [to, cost]))
const parseTowns = R.compose(createTown, noCostFree, R.map(parseTown), R.split(' '), R.defaultTo(''))
const createGraph = R.reduce((graph, town) => addTown(graph, town), newGraph())
const parseGraph = R.compose(R.ifElse(R.isEmpty, InvalidGraph, createGraph), parseTowns)

const findPathRoutes = graph => {
  if (R.equals(graph, InvalidGraph)) {
    return []
  }
  const reduce = (tail, acc = []) => {
    if (R.equals(R.length(tail), 1)) {
      return acc
    }
    const [from, to] = tail
    if (R.isNil(graph.towns[from])) {
      return []
    }
    const fromRoutes = graph.towns[from].routes
    if (R.isNil(fromRoutes[to])) {
      return []
    }
    const routes = R.map(cost => [to, cost])(fromRoutes[to])
    if (R.isEmpty(acc)) {
      return reduce(tail.slice(1), routes)
    }
    //TODO refactor: not pure!
    const copies = []
    R.forEach(route => {
      const copieRoute = cpRoute => R.concat(R.init(cpRoute))([
        R.head(route), R.last(cpRoute) + route[1]
      ])
      copies.push(R.map(copieRoute)(acc))
    })(routes)
    return reduce(tail.slice(1), copies.reduce((acc, copie) => R.concat(acc)(copie), []))
  }
  return R.ifElse(isValidPath, reduce, R.always([]))
}

const mergePaths = dest => route => R.ifElse(
  R.isEmpty,
  R.always(dest),
  () => R.ifElse(
    R.isEmpty,
    R.always(route),
    () => [...R.init(dest), R.head(route), R.last(dest) + route[1]]
  )(dest)
)(route)

const tooMuchSteps = max => R.compose(len => R.gt(len, max), R.length)
const tooExpensive = max => R.compose(cost => R.gt(cost, max), R.last)

const findRoutes = (graph, from, to, options = {}) => {
  const towns = R.keys(graph.towns)
  if (R.isEmpty(towns)) {
    return []
  }
  const routeOnce = R.defaultTo(false)(options.routeOnce)
  const maxSteps = R.min(defInfinity(options.maxSteps), R.length(towns) + 1) + 1
  const maxCost = defInfinity(options.maxCost)
  const alreadyTaken = []
  return (function reduce(from, currentPath = [], results = []) {
    if (R.isNil(graph.towns[from])) {
      return []
    }
    const townRoutes = R.reduce((acc, to) => R.concat(acc, R.map(cost => [to, cost])(graph.towns[from].routes[to])), [])
    const processRoutes = R.forEach(route => {
      if (routeOnce) {
        if (R.contains(R.join('')(route))(alreadyTaken)) {
          return
        }
        //TODO refactor: not pure!
        alreadyTaken.push(R.join('')(route))
      }
      const current = mergePaths(currentPath)(route)
      if (R.or(tooMuchSteps(maxSteps)(current), tooExpensive(maxCost)(current))) {
        return
      }
      const reachDestination = () => R.equals(to, R.head(route))
      const pushAsResult = () => results.push(current)
      const recursiveCall = () => reduce(R.head(route), mergePaths(currentPath)(route), results)
      R.ifElse(reachDestination, pushAsResult, recursiveCall)()
    })
    R.compose(processRoutes, townRoutes, R.keys)(graph.towns[from].routes)
    return results
  })(from)
}

const cheapestRoute = routes => (function reduce(routes, cheapest = null) {
  if (R.isEmpty(routes)) {
    return cheapest
  }
  if (!cheapest) {
    return reduce(R.tail(routes), R.head(routes))
  }
  const route = R.head(routes)
  //TODO refactor: could be better...
  const isCheaperRoute = () => R.lt(R.last(route), R.last(cheapest))
  const hasSameCostButFaster = () => R.equals(R.last(route), R.last(cheapest)) &&
    R.lt(R.length(route), R.length(cheapest))
  const nextCheapest = R.ifElse(
    () => R.or(isCheaperRoute(), hasSameCostButFaster()),
    R.always(route),
    R.always(cheapest)
  )
  return reduce(R.tail(routes), nextCheapest())
})(routes)

module.exports = {
  commons: {
    InvalidGraph,
    dashSplit,
    isArray,
    defInfinity,
    isNotEmpty,
    filterEmpty,
    assembleCost,
    parseRoute,
    parseTown,
    noCostFree,
  },
  parsePath,
  isValidPath,
  newTown,
  addTownRoute,
  mergeTowns,
  newGraph,
  addTown,
  parseGraph,
  findPathRoutes,
  mergePaths,
  findRoutes,
  cheapestRoute,
}
