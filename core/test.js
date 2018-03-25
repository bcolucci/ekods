const test = require('ava')
const R = require('ramda')
const ekods = require('.')
const commons = ekods.commons

test('commons', t => {
  t.deepEqual(commons.InvalidGraph(), {
    towns: []
  })
  t.deepEqual(commons.dashSplit('A -B'), ['A ', 'B'])
  t.deepEqual(commons.isArray(''), false)
  t.deepEqual(commons.isArray([]), true)
  t.is(commons.defInfinity(42), 42)
  t.is(commons.defInfinity(null), Infinity)
  t.is(commons.isNotEmpty([]), false)
  t.is(commons.isNotEmpty([42]), true)
  t.deepEqual(commons.filterEmpty(['A', '', 'B']), ['A', 'B'])
  t.deepEqual(commons.filterEmpty(['A', '', 'B']), ['A', 'B'])
  t.deepEqual(commons.assembleCost(['4', '2']), 42)
  t.deepEqual(commons.parseRoute(['A', 'B', '4', '2']), ['A', 'B', 42])
  t.deepEqual(commons.parseTown('AB42'), ['A', 'B', 42])
  t.deepEqual(commons.noCostFree([
    ['A', 'B', 3],
    ['A', 'B', 0]
  ]), [
    ['A', 'B', 3]
  ])
})

test('parsePath', t => {
  R.forEach(([path, expected]) => t.deepEqual(ekods.parsePath(path), expected))
    ([
      ['', []],
      ['A', ['A']],
      ['A-B', ['A', 'B']]
    ])
})

test('isValidPath', t => {
  R.forEach(([path, expected]) => t.is(ekods.isValidPath(path), expected))
    ([
      [
        [], false
      ],
      [
        ['A'], false
      ],
      [
        ['A', 'B'], true
      ]
    ])
})

test('addTownRoute', t => {
  const expected = {
    name: 'A',
    routes: {
      B: [1, 1, 3],
      C: [5]
    }
  }
  t.deepEqual(R.reduce((town, route) => ekods.addTownRoute(town, route), ekods.newTown('A'))
    ([
      ['B', 1],
      ['B', 1],
      ['B', 3],
      ['C', 5],
    ]), expected)
})

test('mergeTowns', t => {
  R.forEach(([towns, existing, expected]) => t.deepEqual(ekods.mergeTowns(towns, existing), expected))
    ([
      [{
        A: {
          routes: {
            B: [1]
          }
        }
      }, {}, {
        A: {
          routes: {
            B: [1]
          }
        }
      }],
      [{
          A: {
            routes: {
              B: [2, 3],
              C: [4]
            }
          }
        },
        {
          A: {
            routes: {
              B: [1]
            }
          }
        }, {
          A: {
            routes: {
              B: [2, 3, 1],
              C: [4]
            }
          }
        }
      ],
      [{
          A: {
            routes: {
              B: [2, 3],
              C: [4]
            }
          },
          B: {
            routes: {
              A: [1]
            }
          }
        },
        {
          A: {
            routes: {
              B: [1]
            }
          },
          B: {
            routes: {
              A: [2]
            }
          }
        }, {
          A: {
            routes: {
              B: [2, 3, 1],
              C: [4]
            }
          },
          B: {
            routes: {
              A: [1, 2]
            }
          }
        }
      ]
    ])
})

test('parseGraph', t => {
  R.forEach(([graphStr, expected]) => t.deepEqual(ekods.parseGraph(graphStr), expected))
    ([
      ['', commons.InvalidGraph()],
      ['AB3', {
        towns: {
          A: {
            name: 'A',
            routes: {
              B: [3]
            }
          }
        }
      }],
      ['AB1 AB2 AC3 BC2', {
        towns: {
          B: {
            name: 'B',
            routes: {
              C: [
                2
              ]
            }
          },
          A: {
            name: 'A',
            routes: {
              C: [3],
              B: [2, 1]
            }
          }
        }
      }],
      ['BC12 AB1 AB0 AB3 AC2 CA3', {
        towns: {
          C: {
            name: 'C',
            routes: {
              A: [
                3
              ]
            }
          },
          A: {
            name: 'A',
            routes: {
              C: [
                2
              ],
              B: [
                3,
                1
              ]
            }
          },
          B: {
            name: 'B',
            routes: {
              C: [
                12
              ]
            }
          }
        }
      }]
    ])
})

test('findPathRoutes', t => {
  R.forEach(([graphStr, pathStr, expected]) => {
    const graph = ekods.parseGraph(graphStr)
    const routes = ekods.findPathRoutes(graph)(ekods.parsePath(pathStr))
    t.deepEqual(routes, expected)
  })([
    ['AB1', 'A-A', []],
    ['AA3', 'A-A', [
      ['A', 3]
    ]],
    ['AB1 AB2 AB3', 'A-B', [
      ['B', 3],
      ['B', 2],
      ['B', 1]
    ]],
    ['AB1 AB2 BC3 BC4', 'A-B-C', [
      ['B', 'C', 6],
      ['B', 'C', 5],
      ['B', 'C', 5],
      ['B', 'C', 4]
    ]],
    ['AB1 AB2 BC3 BC4 BC5', 'A-B-C', [
      ['B', 'C', 7],
      ['B', 'C', 6],
      ['B', 'C', 6],
      ['B', 'C', 5],
      ['B', 'C', 5],
      ['B', 'C', 4]
    ]],
    ['AB1 AB2 BC3 CD4 CD5 CD6', 'A-B-C-D', [
      ['B', 'C', 'D', 11],
      ['B', 'C', 'D', 10],
      ['B', 'C', 'D', 10],
      ['B', 'C', 'D', 9],
      ['B', 'C', 'D', 9],
      ['B', 'C', 'D', 8]
    ]],
  ])
})

test('mergePaths', t => {
  R.forEach(([route, dest, expected]) => t.deepEqual(ekods.mergePaths(dest)(route), expected))([
    [
      [],
      [],
      []
    ],
    [
      ['A', 1],
      [],
      ['A', 1]
    ],
    [
      ['B', 2],
      ['A', 1],
      ['A', 'B', 3]
    ],
    [
      ['C', 4],
      ['A', 'B', 3],
      ['A', 'B', 'C', 7]
    ],
  ])
})

test('findRoutes', t => {
  R.forEach(([graphStr, from, to, options, expected]) => {
    const graph = ekods.parseGraph(graphStr)
    const results = ekods.findRoutes(graph, from, to, options)
    t.deepEqual(results, expected)
  })([
    ['', 'A', 'C', {},
      []
    ],
    ['AB1', 'A', 'C', {},
      []
    ],
    ['AB1 AC3 BC1', 'A', 'C', {},
      [
        ['C', 3],
        ['B', 'C', 2],
      ]
    ],
    ['AB1 CD3 AD2 AC3 BC1', 'A', 'D', {},
      [
        ['C', 'D', 6],
        ['D', 2],
        ['B', 'C', 'D', 5],
      ]
    ],
    ['AB1 CD3 AD2 AC3 BC1', 'A', 'D', {
        maxSteps: 2
      },
      [
        ['C', 'D', 6],
        ['D', 2],
      ]
    ],
    ['AB1 AB2 BA5 AA7 BC3 CB6 CA4', 'A', 'A', {},
      [
        ['A', 7],
        ['B', 'C', 'A', 9],
        ['B', 'C', 'B', 'A', 16],
        ['B', 'A', 7],
        ['B', 'C', 'A', 8],
        ['B', 'C', 'B', 'A', 15],
        ['B', 'A', 6],
      ]
    ],
    ['AB1 AB2 BA5 AA7 BC3 CB6 CA4', 'A', 'A', {
        maxCost: 10
      },
      [
        ['A', 7],
        ['B', 'C', 'A', 9],
        ['B', 'A', 7],
        ['B', 'C', 'A', 8],
        ['B', 'A', 6],
      ]
    ],
    ['AB1 BC2 CA3 AD4 DC5', 'A', 'A', {},
      [
        ['D', 'C', 'A', 12],
        ['B', 'C', 'A', 6],
      ]
    ],
    ['AB1 BC2 CA3 AD4 DC5', 'A', 'A', {
        routeOnce: true
      },
      [
        ['D', 'C', 'A', 12]
      ]
    ]
  ])
})

test('cheapestRoute', t => {
  R.forEach(([routes, expected]) => t.deepEqual(ekods.cheapestRoute(routes), expected))
    ([
      [
        [], null
      ],
      [
        [
          ['A', 1]
        ],
        ['A', 1]
      ],
      [
        [
          ['A', 1],
          ['A', 1, 1]
        ],
        ['A', 1]
      ],
      [
        [
          ['A', 5],
          ['A', 'B', 3],
          ['A', 'B', 2],
          ['C', 3],
        ],
        ['A', 'B', 2]
      ]
    ])
})
