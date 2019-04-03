const MutationObserverInitOptions = {
  childList: true,
  characterData: true,
  attributes: false,
  subtree: true,
}

function calcChecklistPoints($checkItems) {
  var checkItemPoints = _.map($checkItems, function(checkItem) {
    var checkItemText = $(checkItem).text()
    var match = checkItemText.match(/\[(\d+\.*\d*)\]/)

    return match ? Number(match[1]) : 0
  })

  var sum = _.reduce(
    checkItemPoints,
    function(sum, point) {
      return sum + point
    },
    0,
  )

  return sum
}

function updateChecklistPoints() {
  var $checkItemsLists = $('.js-checklist-items-list')

  $checkItemsLists.each(function() {
    var $checkItems = $(this).find('.js-checkitem-name')
    var point = Math.round(calcChecklistPoints($checkItems) * 100) / 100
    var $title = $(this)
      .parents('.checklist')
      .find('h3')

    if ($title.find('span').length) {
      $pointElm = $title.find('span')
    } else {
      $pointElm = $('<span>').appendTo($title)
    }

    $pointElm.text(' (' + point + ')')
  })
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
  // console.log('$cardTitles: ', $cardTitles)
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

  // console.log('estimatePoint: ', estimatePoint)

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
    // console.log('sortableItem: ', sortableItem)
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
      console.log('$target: ', $target)

      if (
        // モーダルでタスクのタイトルを編集したとき
        $target.hasClass('simpleTextarea--dynamic', 'simpleTextarea', 'autogrowTextarea-input') ||
        // リストが読み込まれたとき
        $target.hasClass('SortableList-itemContainer', 'SortableList-itemContainer--column')
      ) {
        updateListPoints()
      }

      if (
        // モーダルでタスクのタイトルを編集したとき
        $target.hasClass('simpleTextarea--dynamic', 'simpleTextarea', 'autogrowTextarea-input') ||
        // チェックリストが更新されたとき
        $target.hasClass('js-checkitem-name') ||
        // チェックリストにタスクが追加されたとき
        $target.hasClass('js-show-checked-items') ||
        // チェックリストのタイトルを編集したとき
        $target.hasClass('hide-on-edit') ||
        // 一覧ページからカードを選択したとき
        $target.hasClass('js-list-actions') ||
        $target.hasClass('js-list-header')
      ) {
        updateChecklistPoints()
      }
    })
  }),
  500,
)

// $(function() {
//   setTimeout(function() {
//     updateChecklistPoints()
//   }, 3000)
// })

mutationObserver.observe(document.body, MutationObserverInitOptions)
