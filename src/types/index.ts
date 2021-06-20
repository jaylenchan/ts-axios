/** config中method选项的类型约束 */
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

/** config的类型约束 */
export interface AxiosRequestConfig {
  url: string /** url是必须要传递的参数 */
  method?: Method /** method可选，因为默认会给‘get' */
  data?: any /** data可选 */
  params?: any /** params可选 */
  headers?:any /** headers可选 */
}
