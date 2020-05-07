export const getItemIndex = function (el) {
  let index = -1
  while (el) {
    index++
    el = el.previousElementSibling
  }
  return index
}

export const getItemTypeIndex = function (el, itemType) {
  let tempEl = el
  while (tempEl) {
    if (tempEl.getAttribute('item-type') === itemType) {
      break
    } else {
      tempEl = tempEl.parentElement
    }
  }
  return getItemIndex(tempEl)
}
