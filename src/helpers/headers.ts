import { isPlainObject, normalizedHeaderName } from './util'

/**
 * 设置正确的header头部
 * @param headers 
 * @param data  需要data是因为我们只需要对data是普通对象的数据做header头设置的处理
 */
const processHeader = (headers:any, data:any) => {
  headers = normalizedHeaderName(headers, 'Content-Type')
  if(isPlainObject(data)) { /** 如果data是普通对象的话 */
    if(headers  && !headers['Content-Type']) { /** headers头部存在的，同时里头没有设置Content-Type属性 */
      headers['Content-Type'] = 'application/json;charset=utf-8' /** 那就设置成application/json类型 */
    }
  }
  return headers
}

export default processHeader