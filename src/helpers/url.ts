import { isEmpty, isArray, isDate, isPlainObject, encode } from './util'
/**
 * 绑定params到url上
 * @param url
 * @param params
 * @returns string
 */
const bindURL = (url: string, params?: any): string => {
  if (!params) return url /** 如果params不传递就不存在，是params:null | undefined，直接返回 */
  const parts: string[] = [] /** 用来存放key=val这种形式的字符串 */
  Object.entries(params).forEach(([key, val]) => {
    /** 获取每一个params中的key和val */
    if (isEmpty(val))
      return /** 如果val为空，直接跳过本次循环到下一次循环（注意：forEach的return不是终止全部的意思） */
    let values = [] /** 因为val可能是数组类型，也可能是其他类型，使用values到时候可以全部统一成数组类型 */
    if (isArray(val)) {
      key += '[]' /** 如果val是一个数组，说明是foo: [] 这种形式的键值对。那么久对foo变成foo[] */
      values = val /** 同时将values指向val，因为val此时就是数组 */
    } else {
      values = [val] /** 否则如果不是数组，就变成数组，同时注意这里的键foo不需要变化 */
    }
    /** 代码执行到这个地方，说明在本次循环，对于所有键值对中的值val都被转换成了数组的形式，这为了下边统一使用遍历做准备 */
    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })
  let serializedParams = parts.join(
    '&'
  ) /** 现在就将parts中的key=val拼接成key1=val1&key2=val2的形式 */
  if (serializedParams) {
    /** 清除url上的哈希值 */
    const clearHash = () => {
      const markIndex = url.indexOf('#')
      if (markIndex !== -1) {
        url = url.slice(0, markIndex)
      }
    }

    /** 处理考虑url本来就有参数的情况，绑定params到url上， */
    const bindParams = () => {
      if (url.indexOf('?') > -1) {
        url += '&' + serializedParams
      } else {
        url += '?' + serializedParams
      }
    }
    clearHash()
    bindParams()
  }
  return url
}

export default bindURL