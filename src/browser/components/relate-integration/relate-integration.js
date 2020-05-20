/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import { useEffect } from 'react'
import { RelateClient } from '@relate/client'

export default function RelateIntegration({
  appName,
  relateRemote,
  searchString = location.search,
  tokenParamName = '_appLaunchToken',
  ...rest
}) {
  useEffect(() => {
    async function load() {
      const launchToken = new URLSearchParams(searchString).get(tokenParamName)
      if (!launchToken) {
        return
      }
      const opts = { appName }
      if (relateRemote) {
        opts.remote = relateRemote
      }
      const relateClient = new RelateClient(opts)

      try {
        const data = await relateClient.getAppLaunchData(launchToken)
        const { accessToken, principal, dbms } = data
        if (dbms && dbms.connectionUri) {
          if (rest.onTokenChange) {
            rest.onTokenChange(principal, accessToken, dbms.connectionUri)
          }
        }
      } catch (e) {
        if (rest.onTokenChange) {
          // Empty to indicate error
          rest.onTokenChange()
        }
      }
    }
    load()
  }, [searchString])
  return null
}
