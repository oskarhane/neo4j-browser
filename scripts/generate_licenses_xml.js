/*
 * Copyright (c) 2002-2017 "Neo4j, Inc,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const js2xmlparser = require('js2xmlparser')
const externalDependencies = require('./static_data/external_dependencies')

process.stdin.setEncoding('utf8')

let data = ''

process.stdin.on('readable', () => {
  const chunk = process.stdin.read()
  if (chunk !== null) {
    data += chunk
  }
})

process.stdin.on('end', () => {
  let packagesList = parseJson(data)

  process.stdout.write(packagesList)
  process.exit(1)
})

function buildDependencyObject (id, name, license) {
  const tempObj = { '@': { id: '', name: '' }, license: '' }
  tempObj['@']['id'] = id
  tempObj['@']['name'] = name
  tempObj['license'] = license

  return tempObj
}

function parseJson (data) {
  let parsedObj = JSON.parse(data).data.body

  const resArr = [
    ...externalDependencies.map(dep =>
      buildDependencyObject(dep[0], dep[1], dep[2])
    ),
    ...parsedObj.map(dep => buildDependencyObject(dep[0], dep[0], dep[2]))
  ]

  let res = {
    'missing-artifact': {
      artifact: resArr
    }
  }

  let js2xmlparseOptions = { declaration: { include: false } }

  return js2xmlparser.parse('licensing-requirements', res, js2xmlparseOptions)
}
