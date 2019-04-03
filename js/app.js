const MutationObserverInitOptions = {
  childList: true,
  characterData: true,
  attributes: false,
  subtree: true,
}

const pointConfigData = {
  estimate: {
    className: 'js-estimate-point',
    template: '(__point__)',
  },
  actual: {
    className: 'js-actual-point',
    template: '[__point__]',
  },
}

const _getPoint = ($cardTitles, pointRegex) => {
  const points = $cardTitles.map(i => {
    const titleText = $($cardTitles[i]).text()
    const match = titleText.match(pointRegex)
    return match ? Number(match[1]) : 0
  })

  return _.reduce(
    points,
    (sum, point) => {
      return sum + point
    },
    0,
  )
}

const _updateListPoints = ($headerTitle, pointType, point) => {
  const { className, template } = pointConfigData[pointType]

  _displayPoint($headerTitle, className, template, point)
}

const _displayPoint = ($target, className, template, point) => {
  let $point = $target.find(`span.${className}`)
  if (!$point.length) {
    $point = $('<span>')
      .addClass(className)
      .appendTo($target)
  }

  $point.text(template.replace('__point__', point))
}

const updateListPoints = () => {
  // ボード内の各リストをグルグルする
  $('.SortableItem').each((_i, sortableItem) => {
    const $cardTitles = $(sortableItem).find('.BoardCardWithCustomProperties-name')
    const $headerTitle = $(sortableItem).find('.BoardColumnHeaderTitle')

    const estimatePoint = _getPoint($cardTitles, /\((\d+\.*\d*)\)/)
    const actualPoint = _getPoint($cardTitles, /\[(\d+\.*\d*)\]/)

    _updateListPoints($headerTitle, 'estimate', estimatePoint)
    _updateListPoints($headerTitle, 'actual', actualPoint)
  })
}

const displaySubTaskPoints = () => {
  const $itemTitles = $('.SingleTaskPane .TaskList .autogrowTextarea-shadow')
  const pointData = {
    estimate: _getPoint($itemTitles, /\((\d+\.*\d*)\)/),
    actual: _getPoint($itemTitles, /\[(\d+\.*\d*)\]/),
  }

  const $subTaskGrid = $('.SingleTaskPane .SubtaskGrid.SingleTaskPane-subtaskGrid')
  let $subTaskPointContainer = $subTaskGrid.find('.js-sub-task-point-container')
  if (!$subTaskPointContainer.length) {
    $subTaskPointContainer = $('<div>')
      .addClass('js-sub-task-point-container')
      .prependTo($subTaskGrid)
  }

  for (const key in pointConfigData) {
    const { className, template } = pointConfigData[key]
    _displayPoint($subTaskPointContainer, className, template, pointData[key])
  }
}

const mutationObserver = new MutationObserver(
  _.debounce(function(mutations) {
    mutations.forEach(mutation => {
      const $target = $(mutation.target)

      if (
        // カードのモーダルでタスクのタイトルを編集したとき
        $target.hasClass('simpleTextarea--dynamic', 'simpleTextarea', 'autogrowTextarea-input') ||
        // リストが読み込まれたとき
        $target.hasClass('SortableList-itemContainer', 'SortableList-itemContainer--column')
      ) {
        updateListPoints()
      }

      if (
        // カードのモーダルでサブタスクが読み込まれたとき
        $target.hasClass('ModalPaneWithBuffer-pane') ||
        // カードのモーダルでサブタスクを編集したとき
        $target.hasClass('simpleTextarea', 'autogrowTextarea-input') ||
        // カードのモーダルが表示されたとき
        $target.hasClass('quill-container')
      ) {
        displaySubTaskPoints()
      }
    })
  }),
  500,
)

mutationObserver.observe(document.body, MutationObserverInitOptions)
