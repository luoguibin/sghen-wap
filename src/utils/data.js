
/**
 * 将数组转为Map
 * @param {Array} data
 * @param {String} key
 * @returns {Map}
 */
export const arrayToMap = function (data = [], key = 'id') {
  const map = {}
  data.forEach(o => {
    map[o[key]] = o
  })
  return map
}

const getMaxValue = function (list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] >= value) {
      return list[i]
    }
  }
  return null
}

const STEP_LIST_MAP = {
  // 0.3, 0.6, 0.9, 1.2, 1.5, 1.8,
  3: [3, 6, 9, 12, 15, 24, 30, 36, 48, 60, 90, 120, 150, 180, 240, 300, 450, 600, 900],
  // 0.4, 1, 1.2, 2,
  4: [4, 8, 12, 20, 40, 48, 80, 100, 120, 160, 200, 240, 400, 500, 600, 800, 1000],
  // 0.5, 1, 1.25, 2.5,
  5: [5, 10, 15, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 800, 1000]
}

export const calMax5 = function (data, count = 5) {
  let value = 0
  if (typeof data[0] === 'number') {
    data.forEach((v) => {
      value = Math.max(value, v)
    })
  } else {
    data.forEach((o) => {
      value = Math.max(value, o.value)
    })
  }

  const list = STEP_LIST_MAP[count] || STEP_LIST_MAP[5]
  let fiveVal = getMaxValue(list, value)
  if (fiveVal !== null) {
    return fiveVal
  }

  const MAX = list[list.length - 1]
  let tenVal = 1
  while (value > MAX) {
    tenVal *= 10
    value /= 10
  }
  fiveVal = getMaxValue(list, value)

  return fiveVal * tenVal
}
