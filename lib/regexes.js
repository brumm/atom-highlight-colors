'use babel'

import cssColorList from 'css-color-list'

const regexes = [
  '#(?:[0-9a-f]{2}){2,4}',
  '#[0-9a-f]{3}',
  'rgb\\((-?\\d+\\s*,\\s*){2}(-?\\d+\\s*)\\)',
  'rgb\\((-?\\d+%\\s*,\\s*){2}(-?\\d+%\\s*)\\)',
  'rgba\\((-?\\d+\\s*,\\s*){3}(-?\\d+(\\.\\d+)?\\s*)\\)',
  'rgba\\((-?\\d+%\\s*,\\s*){3}(-?\\d+(\\.\\d+)?\\s*)\\)',
  'hsl\\((-?\\d+\\s*,\\s*)(-?\\d+%\\s*,\\s*)(-?\\d+%\\s*)\\)',
  'hsla\\((-?\\d+\\s*,\\s*)(-?\\d+%\\s*,\\s*){2}(-?\\d+(\\.\\d+)?\\s*)\\)',
  [...cssColorList(), 'transparent'].map(color => `\\b${color}\\b`).join('|'),
]

export default new RegExp(regexes.join('|'), 'gi')
