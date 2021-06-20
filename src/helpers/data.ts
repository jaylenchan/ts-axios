import { isPlainObject } from './util'

/** 对axios config中的data做处理 - 处理普通对象 */
export const  transformRequest = (data:any) :any => {
  /** 对于FormData, Blob, ArrayBuffer这些类型不需要做转换，xhr.send(data)中的data是可以允许这些类型传递的 */
  /** 我们只需要对axios传入的普通对象做处理 */
  if(isPlainObject(data)) return JSON.stringify(data) /** 是普通对象的话直接序列化反回 */
  return data /** 否则直接返回data，此时data啥类型直接原样返回啥类型 */
}


/**
 * 对data进行正确的处理，如果是字符串要解析成对象
 * @param data 
 * @returns 
 */
export const transformResponse = (data: any) :any => {
  if(typeof data === 'string') {
    try{ /** 使用try catch是因为说这个data可能是普通的字符串，如果直接去解析可能报错的 */
     data = JSON.parse(data)
    }catch(err) {
      // 啥都不做
    }
  }
  return data
}



