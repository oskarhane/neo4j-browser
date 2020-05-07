/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import React from 'react'
import { render } from '@testing-library/react'
import { flushPromises } from 'services/utils'
import RelateIntegration from './relate-integration'

jest.mock('@relate/client')
const { RelateClient } = require('@relate/client')

describe('<RelateIntegration>', () => {
  test('does not init client if no _appLaunchToken in url params', () => {
    // Given
    const mocked = jest.fn()
    RelateClient.mockImplementation(mocked)
    const searchString = ''

    // When
    const { container } = render(
      <RelateIntegration searchString={searchString} />
    )

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
    expect(mocked).not.toHaveBeenCalled()
  })

  test('calls the onTokenChange with params if there is _appLaunchToken in url params', async () => {
    // Given
    const onTokenChangeFn = jest.fn()
    const LAUNCH_TOKEN = 'hello'
    const RESPONSE = {
      accessToken: 'test-token',
      principal: 'neo4j',
      dbms: {
        connectionUri: 'test-uri'
      }
    }
    const mocked = jest.fn(() => {
      return Promise.resolve(RESPONSE)
    })
    RelateClient.mockImplementation(function() {
      this.getAppLaunchData = mocked
    })
    const searchString = `?_appLaunchToken=${LAUNCH_TOKEN}`

    // When
    const { container } = render(
      <RelateIntegration
        searchString={searchString}
        onTokenChange={onTokenChangeFn}
      />
    )

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
    expect(mocked).toHaveBeenCalledWith(LAUNCH_TOKEN)

    // async, need to flush promises before assertions
    await flushPromises()

    expect(onTokenChangeFn).toHaveBeenCalledTimes(1)
    expect(onTokenChangeFn).toHaveBeenCalledWith(
      RESPONSE.principal,
      RESPONSE.accessToken,
      RESPONSE.dbms.connectionUri
    )
  })

  test('calls the onTokenChange WITHOUT params if there is an invalid _appLaunchToken in url params', async () => {
    // Given
    const onTokenChangeFn = jest.fn()
    const LAUNCH_TOKEN = 'hello'

    const mocked = jest.fn(() => {
      return Promise.reject(new Error('ERROR, CANNOT VALIDATE'))
    })
    RelateClient.mockImplementation(function() {
      this.getAppLaunchData = mocked
    })
    const searchString = `?_appLaunchToken=${LAUNCH_TOKEN}`

    // When
    const { container } = render(
      <RelateIntegration
        searchString={searchString}
        onTokenChange={onTokenChangeFn}
      />
    )

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
    expect(mocked).toHaveBeenCalledWith(LAUNCH_TOKEN)

    // async, flush promises
    await flushPromises()

    expect(onTokenChangeFn).toHaveBeenCalledTimes(1)
    expect(onTokenChangeFn).toHaveBeenCalledWith()
  })
})
