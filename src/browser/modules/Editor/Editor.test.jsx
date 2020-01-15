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
import { createBus } from 'suber'
import { Editor } from './Editor'
import {
  FOCUS,
  editContent,
  setContent
} from 'shared/modules/editor/editorDuck'

test('Editor bus listeners are setup on mount', async () => {
  // Local mock
  window.focus = jest.fn()
  // Given
  const bus = createBus()
  const SET_STRING = 'SET FROM TEST'
  const EDIT_STRING = 'EDIT FROM TEST'
  const props = {
    useDb: null,
    enableEditorAutocomplete: false,
    enableEditorLint: false,
    history: [],
    cmdchar: ':',
    schema: {},
    bus
  }

  // Render
  const { findByText } = render(<Editor {...props} />)

  // The SET_CONTENT action
  // When
  const setAction = setContent(SET_STRING)
  bus.send(setAction.type, setAction)

  // Then
  const setTextElement = await findByText(SET_STRING)
  expect(setTextElement).toBeDefined()

  // The EDIT_CONTENT action
  // When
  const editAction = editContent('x', EDIT_STRING)
  bus.send(editAction.type, editAction)

  // Then
  const editTextElement = await findByText(EDIT_STRING)
  expect(editTextElement).toBeDefined()

  // FOCUS action
  // Reset because it has already been called a few times when loaded
  window.focus.mockClear()
  // When
  bus.send(FOCUS)

  // Then
  expect(window.focus).toHaveBeenCalledTimes(1)
})
