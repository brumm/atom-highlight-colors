'use babel'

import { CompositeDisposable, Disposable } from 'atom'
import get from 'lodash.get'
import set from 'lodash.set'

import searchRegex from './regexes'

const makeContainer = ({ items, size, onClick, isInteractive }) => {
  const container = document.createElement('div')
  container.classList.add('highlight-color-container')

  if (isInteractive) {
    container.classList.add('interactive')
  }

  container.style.setProperty('--highlight-color-line-height', `${size}px`)

  for (let { color, resultRange } of items) {
    const element = document.createElement('div')
    element.classList.add('highlight-color-item')
    element.style.setProperty('--highlight-color-color', color)

    if (isInteractive) {
      element.addEventListener('click', () => onClick(resultRange))
    }

    container.appendChild(element)
  }

  return container
}

class HighlightColors {
  subscriptions = new CompositeDisposable()
  results = {}
  decorations = {}

  consumeColorPicker = service => {
    this.colorPickerService = service

    const editorIds = Object.keys(this.results)
    atom.workspace
      .getTextEditors()
      .filter(({ id }) => !editorIds.includes(id))
      .forEach(this.updateDecorations)

    return new Disposable(this.consumeColorPicker)
  }

  openColorPicker = (range, editor) => {
    editor.setCursorBufferPosition(range.start)
    this.colorPickerService.open()
  }

  activate = () => {
    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.results[editor.id] = this.results[editor.id] || {}
        this.decorations[editor.id] = this.decorations[editor.id] || []

        editor.onDidChange(() => this.updateDecorations(editor))
      })
    )
  }

  updateDecorations = editor => {
    for (const decoration of this.decorations[editor.id]) {
      decoration.getMarker().destroy()
    }

    this.decorations[editor.id] = []
    this.results[editor.id] = {}
    const lineHeight = editor.getLineHeightInPixels()

    editor.scan(searchRegex, result => {
      const row = get(this.results, [editor.id, result.range.start.row])
      const match = {
        resultRange: result.range,
        range: editor.bufferRangeForBufferRow(result.range.start.row),
        color: result.matchText,
      }

      if (row) {
        set(this.results, [editor.id, result.range.start.row, row.length], match)
      } else {
        set(this.results, [editor.id, result.range.start.row], [match])
      }
    })

    for (const row in this.results[editor.id]) {
      this.results[editor.id][row].sort(({ range: rangeA }, { range: rangeB }) =>
        rangeA.compare(rangeB)
      )
      const rightMostRange = this.results[editor.id][row][this.results[editor.id][row].length - 1]
        .range

      this.decorations[editor.id].push(
        editor.decorateMarker(editor.markBufferRange(rightMostRange), {
          type: 'overlay',
          class: 'highlight-color',
          item: makeContainer({
            items: this.results[editor.id][row],
            size: lineHeight,
            onClick: range => this.openColorPicker(range, editor),
            isInteractive: this.colorPickerService !== undefined,
          }),
          position: 'head',
          avoidOverflow: false,
        })
      )
    }
  }

  deactivate = () => {
    this.subscriptions.dispose()
  }
}

export default new HighlightColors()
