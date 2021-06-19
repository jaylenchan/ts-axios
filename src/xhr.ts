import { AxiosRequestConfig } from './types'

export default function xhr(config: AxiosRequestConfig):void {
  const { url, method = 'get', data = null } = config
  const request = new XMLHttpRequest()
  /** 开启一条请求连接：请求方法大写 - url - true是异步的意思 */
  request.open(method.toUpperCase(), url,  true)
  request.send(data)
}