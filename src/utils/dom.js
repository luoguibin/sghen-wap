/**
 * @description 获取元素位置下标
 * @param {HTMLElement} el
 */
export const getItemIndex = function (el) {
  let index = -1
  while (el) {
    index++
    if (el.hasAttribute('item-empty')) {
      console.log('getItemIndex item-empty');
      index--
    }
    el = el.previousElementSibling
  }
  return index
}

/**
 * @description 通过当前元素获取指定itemType元素的位置下标
 * @param {HTMLElement} el
 */
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

/**
 * @description 获取元素的类型对象
 * @param {HTMLElement} el
 */
export const getItemTypeObj = function (el) {
  let tempEl = el
  while (tempEl) {
    if (tempEl.getAttribute('item-type')) {
      return { el: tempEl, itemType: tempEl.getAttribute('item-type') }
    }
    tempEl = tempEl.parentElement
  }
  return null
}
