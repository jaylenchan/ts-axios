/** config中method选项的类型定义 */
export type Method =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'

/** config的类型定义 */
export interface AxiosRequestConfig {
  url: string /** url是必须要传递的参数 */
  method?: Method /** method可选，因为默认会给‘get' */
  data?: any /** data可选 */
  params?: any /** params可选 */
  headers?: any /** headers可选 */
  responseType?: XMLHttpRequestResponseType /** responseType可选，后面这个类型其实就是一个内置的联合类型而已 */
  timeout?: number /** timeout可选，设置请求超时时间 */
}

/** response的类型定义 */
export interface AxiosResponse {
  data: any
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

/** promise方式的response类型定义 */
export interface AxiosPromise extends Promise<AxiosResponse> {

}
