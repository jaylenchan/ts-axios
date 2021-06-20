import { AxiosPromise } from './types/index'
import { AxiosRequestConfig } from './types'
import { handleReadyStateChange, setRequestHeader, setResponseType } from './helpers/util'


export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve) => {
    const {
      url,
      method = 'get',
      data = null,
      headers,
      responseType = ''
    } = config /** 这里headers不用给默认值，因为一定有值，最少都是一个空对象 */
    const request = new XMLHttpRequest()
    /** 开启一条请求连接：请求方法大写 - url - true是异步的意思 */
    request.open(method.toUpperCase(), url, true)
    /** 监听响应变化，同时处理响应数据 */
    handleReadyStateChange(request, responseType, config, resolve)
    /** 设置响应的类型 */
    setResponseType(request, responseType)
    /** 设置请求header头部 */
    setRequestHeader(request, headers, data)
    request.send(data)
  })
}


