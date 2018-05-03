/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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
/* global d3 */
import { Component } from 'preact'
import * as topojson from 'topojson'
import { StyledStatsBar, PaddedDiv } from '../styled'
import { MapWrapper } from './MapView.styled'
import { getPoints } from './helpers'

const width = 900
const height = 350

const calcOffsetAndScale = (data, path, oldScale) => {
  const bounds = path.bounds(data)
  const hscale = oldScale * width / (bounds[1][0] - bounds[0][0] + 1)
  const vscale = oldScale * height / (bounds[1][1] - bounds[0][1] + 1)
  const scale = hscale < vscale ? hscale : vscale
  const offset = [
    width - (bounds[0][0] + bounds[1][0]) / 2,
    height - (bounds[0][1] + bounds[1][1]) / 2
  ]
  return {
    scale,
    offset
  }
}

const graticule = d3.geo.graticule()

export class MapView extends Component {
  state = { points: [] }
  componentDidMount () {
    this.svg = d3
      .select(this.node)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    this.initMap()
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    this.makeState(props)
  }
  initMap () {
    this.projection = d3.geo
      .mercator()
      .scale(250)
      .precision(0.3)
      .center([13.320255, 52.52831499])
      .translate([width / 2, height / 2])
    this.path = d3.geo.path().projection(this.projection)
    this.g = null
    this.updateZoom()
    this.g = this.svg
      .append('g')
      .call(this.zoom)
      .append('g')
    this.g
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
    this.g
      .append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', this.path)
    d3.json('assets/data/world-50m.json', (error, world) => {
      if (error) {
        console.log('error: ', error)
        return
      }
      this.g
        .insert('path', '.graticule')
        .datum(topojson.feature(world, world.objects.land))
        .attr('class', 'land')
        .attr('d', this.path)
      this.g
        .insert('path', '.graticule')
        .datum(
          topojson.mesh(world, world.objects.countries, function (a, b) {
            return a !== b
          })
        )
        .attr('class', 'boundary')
        .attr('d', this.path)
    })
  }
  updateZoom = () => {
    this.zoom = d3.behavior
      .zoom()
      .translate(this.projection.translate())
      .scale(this.projection.scale())
      .scaleExtent([height, 8 * height])
      .on('zoom', this.zoomed)
  }
  zoomed = () => {
    this.projection.translate(d3.event.translate).scale(d3.event.scale)
    this.g.selectAll('path').attr('d', this.path)
  }
  drawPoints = points => {
    if (!this.svg || !this.g) return
    const data = JSON.parse(createPointsJson(points))
    const center = d3.geo.centroid(data)
    // const { scale, offset } = calcOffsetAndScale(
    //   data,
    //   this.path,
    //   this.projection.scale()
    // )
    // this.projection = d3.geo
    //   .mercator()
    //   .scale(Math.min(scale, 3200))
    //   .precision(this.projection.precision())
    //   .center(center)
    //   .translate(offset)
    this.projection = d3.geo
      .mercator()
      .scale(this.projection.scale())
      .precision(this.projection.precision())
      .center(center)
      .translate(this.projection.translate())
    this.path = d3.geo.path().projection(this.projection)
    this.updateZoom()
    this.g
      .append('path')
      .datum(data)
      .classed('geopath', true)
      .attr('d', this.path)
  }
  makeState (props) {
    const { result } = props
    const points = getPoints(result)
    this.setState({ points })
  }
  render () {
    const { points } = this.state
    this.drawPoints(points)
    return (
      <PaddedDiv>
        <MapWrapper>
          <div ref={node => (this.node = node)} />
        </MapWrapper>
      </PaddedDiv>
    )
  }
}

export class MapViewStatusbar extends Component {
  render () {
    return <StyledStatsBar>yo!</StyledStatsBar>
  }
}

const createPointsJson = (points = []) => {
  const pointJson = point => {
    return `
    {
      "geometry": {
          "type": "Point", 
          "coordinates": [
              ${point.x}, 
              ${point.y}
          ]
      }, 
      "type": "Feature"
  }
    `
  }
  return `
  {
    "type": "FeatureCollection", 
    "features": [${points.map(pointJson).join(',')}]
  } 
  `
}
