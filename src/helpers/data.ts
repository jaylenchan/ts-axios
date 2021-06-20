import { isPlainObject } from './util'

/** 对axios config中的data做处理 - 处理普通对象 */
const  transformRequest = (data:any) :any => { /** 叫做transformRequest,是因为发出请求前会对data处理，接收响应后也会对data处理，叫这个名字统一 */
  /** 对于FormData, Blob, ArrayBuffer这些类型不需要做转换，xhr.send(data)中的data是可以允许这些类型传递的 */
  /** 我们只需要对axios传入的普通对象做处理 */
  if(isPlainObject(data)) return JSON.stringify(data) /** 是普通对象的话直接序列化反回 */
  return data /** 否则直接返回data，此时data啥类型直接原样返回啥类型 */
}


export default transformRequest

