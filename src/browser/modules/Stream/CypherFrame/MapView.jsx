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
import React, { Component } from 'react'
import d3 from 'd3'
import * as topojson from 'topojson'
import { StyledStatsBar } from '../styled'
import { MapWrapper } from './MapView.styled'
import { getPoints } from './helpers'

const width = 900
const height = 350

const graticule = d3.geo.graticule()

export class MapView extends Component {
  constructor () {
    super()
    this.config = {
      circleRadius: 5
    }
    this.state = { points: [] }
  }
  componentDidMount () {
    this.projection = d3.geo.mercator()
    this.svg = d3
      .select(this.node)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    this.initMap()
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    // this.makeState(props)
  }
  initMap () {
    this.projection.precision(0.3).scale(1000)
    this.path = d3.geo.path().projection(this.projection)
    this.g = null
    this.updateZoom()
    this.g = this.svg
      .append('g')
      .call(this.zoom)
      .attr('transform', `translate(0,0) scale(1)`)
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
      .translate([0, 0])
      .scale(1)
      .scaleExtent([0.2, 10])
      .on('zoom', this.zoomed)
  }
  zoomed = () => {
    this.g.attr(
      'transform',
      'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')'
    )
    // Scale back strokes when zooming
    this.g
      .selectAll('.geopath, .boundary')
      .style('stroke-width', 1 / d3.event.scale + 'px')

    // Keep points same size
    this.g.selectAll('circle').attr('r', () => {
      return this.config.circleRadius / d3.event.scale
    })
  }
  drawPoints = points => {
    if (!this.svg || !this.g || !points.length) {
      return
    }
    const dataPoints = points.map(p => [p.x, p.y])

    this.g
      .append('g')
      .attr('class', 'circles')
      .selectAll('circle')
      .data(dataPoints)
      .enter()
      .append('circle')
      .attr('cx', d => this.projection(d)[0])
      .attr('cy', d => this.projection(d)[1])
      .attr('r', this.config.circleRadius)

    this.centerAndZoom(this.g.select('.circles'))
  }
  centerAndZoom (selected) {
    const obbox = this.svg.node().getBBox()
    const vx = obbox.x
    const vy = obbox.y
    const vw = obbox.width
    const vh = obbox.height

    const bbox = selected.node().getBBox()
    const bx = bbox.x
    const by = bbox.y
    const bw = bbox.width
    const bh = bbox.height

    const dx = vx - bx
    const dy = vy - by

    const scale =
      Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))) * 0.6
    const tx = -bx * scale + vx + vw / 2 - (bw * scale) / 2
    const ty = -by * scale + vy + vh / 2 - (bh * scale) / 2
    const translate = [tx, ty]
    this.svg.call(this.zoom.translate(translate).scale(scale).event)
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
      <MapWrapper>
        <div ref={node => (this.node = node)} />
      </MapWrapper>
    )
  }
}

export class MapViewStatusbar extends Component {
  render () {
    return <StyledStatsBar>yo!</StyledStatsBar>
  }
}
