import { AxiosPromise, AxiosResponse } from './types/index';
import bindURL from './helpers/url'
import { transformRequest, transformResponse } from './helpers/data'
import processHeader from './helpers/headers'
import { AxiosRequestConfig } from './types'
import xhr from './xhr'

function axios(config: AxiosRequestConfig):AxiosPromise {
  /** 处理config */
  processConfig(config) 
  /** 将处理后的config传入xhr函数，发送请求 */
  return xhr(config).then(resopnse => {
    return transformResponseData(resopnse)
  })
}

/** 处理请求配置 */
function processConfig(config: AxiosRequestConfig) :void {
  config.url = transformURL(config) /** 转换URL */
  config.headers = transformHeaders(config) /** 转换axios的headers - 设置正确请求头 - 必须在data之前，因为先处理了data的话，普通对象直接变json字符串内部逻辑就没效果了 */
  config.data = transformRequestData(config) /** 转换axios的data */
}

/** 处理url参数，将params按照要求绑定到url后边 */
function transformURL(config: AxiosRequestConfig) :string {
  const { url, params } = config
  return bindURL(url, params)
}

/** 处理请求data，将data转换成符合xhr.send(body)符合body要求的格式 */
function transformRequestData(config: AxiosRequestConfig) :string {
  const { data } = config
  return transformRequest(data)
}

/** 处理请求header， 将header设置成符合xhr.setRequestheader的正确格式 */
function transformHeaders(config: AxiosRequestConfig) :string {
  const { headers = {}, data } = config /** 因为headers可选，为了防止用户不传递这里给一个空对象 */
  return processHeader(headers, data)
}

function transformResponseData(response: AxiosResponse) : AxiosResponse {
  response.data = transformResponse(response.data)
  return response
}
export default axios
