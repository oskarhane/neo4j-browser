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
 *
 */

import { NATIVE } from 'services/bolt/boltHelpers'

export function formatCredentials(username, token, uri) {
  if (!uri) {
    return Promise.reject(Error('No credentials found'))
  }
  const tlsLevel = uri.startsWith('neo4j+s://') || false
  const connectUrl = uri.replace('neo4j+s://', 'neo4j://')
  return Promise.resolve({
    username,
    password: token,
    encrypted: tlsLevel,
    host: connectUrl,
    authenticationMethod: NATIVE
  })
}
