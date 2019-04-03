const MutationObserverInitOptions = {
  childList: true,
  characterData: true,
  attributes: false,
  subtree: true,
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
  const pointConfigData = {
    estimate: {
      pointClassName: 'js-estimate-point',
      pointTemplate: '(__point__)',
    },
    actual: {
      pointClassName: 'js-actual-point',
      pointTemplate: '[__point__]',
    },
  }
  const { pointClassName, pointTemplate } = pointConfigData[pointType]

  let $point
  if ($headerTitle.find(`span.${pointClassName}`).length) {
    $point = $headerTitle.find(`span.${pointClassName}`)
  } else {
    $point = $('<span>')
      .addClass(pointClassName)
      .appendTo($headerTitle)
  }

  $point.text(pointTemplate.replace('__point__', point))
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

const mutationObserver = new MutationObserver(
  _.debounce(function(mutations) {
    mutations.forEach(mutation => {
      const $target = $(mutation.target)

      if (
        // モーダルでタスクのタイトルを編集したとき
        $target.hasClass('simpleTextarea--dynamic', 'simpleTextarea', 'autogrowTextarea-input') ||
        // リストが読み込まれたとき
        $target.hasClass('SortableList-itemContainer', 'SortableList-itemContainer--column')
      ) {
        updateListPoints()
      }
    })
  }),
  500,
)

mutationObserver.observe(document.body, MutationObserverInitOptions)
