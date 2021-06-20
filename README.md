### 定义类型约束

`types/index.ts`: 项目中所有公共的类型定义文件

为了约束传入`axios`的`config`配置对象，我们使用了接口定义了`config`的相关约束条件。

```ts
 export interface AxiosRequestConfig {
  url: string, /** url是必须要传递的参数 */
  method?: string, /** method可选，因为默认会给‘get' */
  data?: any, /** data可选 */
  params?: any /** params可选 */
}
```

虽然我们定义了`method`的的具体类型，但是对于`method`选项，我们需要进一步严格限制，因为`method`并不是任意可以选择的字符串，它应该符合`http method`的要求。所以，接下来，我们要进一步定义`method`的类型。由于`method`的取值在可选的范围内，所以我们可以使用type定义一个`method`的类型。

```ts
/** config中method选项的类型约束 */
export type Method = 
'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'|
'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH'
```

然后我们将`AxiosRequestConfig`中的`method`选项替换如下

```ts
 export interface AxiosRequestConfig {
  ...
  method?: Method, /** method可选，因为默认会给‘get' */
  ...
}
```

### 实现请求逻辑

在完成类型定义之后，接下来我们就来实现请求的逻辑。这里我们为了符合模块化编程的思想，我们将请求的逻辑单独封装一个模块。我们创建一个文件`src/xhr.ts`，在这个文件里头我们去实现它的请求逻辑。

```ts
import { AxiosRequestConfig } from './types'

/** 定义xhr函数实现请求逻辑 */
export default function xhr(config: AxiosRequestConfig) {
  const { url, method = 'get', data = null } = config
}
```

以上我们定义了`xhr`函数，并且对传入配置`config`进行了类型的约束。在函数体里头，我们对`config`配置进行了解构。由于在定义类型的时候，`url`一定是一个毕传的选项，所以在解构的时候我们并不需要担心传入为空。而对于`method`和`data`我们在定义的时候是允许传入为空的，所以在这个地方解构的时候，我们赋予`method`和`data`默认值。对于`method`我们默认是`get`请求，对于`data`因为我们会使用到`XMLHttpRequest`对象，发送的时候对于`get`发送的`data`就是空值，所以赋予了`null`。

接下来我们开始创建`XMLHttpRequest`对象，并书写基本逻辑

```ts
export default function xhr(config: AxiosRequestConfig) :void  {
  const { url, method = 'get', data = null } = config
+  const request = new XMLHttpRequest()
  /** 开启一条请求连接：请求方法大写 - url - true是异步的意思 */
+  request.open(method.toUpperCase(), url,  true)
+  request.send(data)
}
```

以上我们创建了`XMLHttpRequest`对象， 同时使用`request.open()`方法开启了一条请求连接，并对其传入了相应参数，其中方法需要转换成大写，最后一个参数设置为`true`表示这是一个异步请求。最终我们使用`request.send()`方法将请求发送。

定义完xhr函数之后，接下来我们就可以将这个函数导入到`src/index.ts`中使用了。

```ts
import { AxiosRequestConfig } from './types'
import xhr from './xhr'

function axios(config: AxiosRequestConfig):void {
  xhr(config)
}
```

我们在`examples`目录下存放的是项目的`demo`文件，用来测试我们写的`axios`库。`examples/simple`目录下存放的是以上书写的axios的测试文件。启动`devserver`之后，我们点击`simple`链接，打开控制台可以发现已经发送出去了一条`get`请求，响应也是成功了的。但是，就目前来说，我们的项目中测试的代码是这样的

```ts
axios({
  method: 'get',
  url: '/simple/get',
  params: {
    a: 1,
    b: 2
  }
})
```

在浏览器的`Network`面板中，我们会发现请求的`url`却是这样子的：

```ts
http://localhost:8080/simple/get
```

也就是说，我们并没有将

```ts 
 params: {
    a: 1,
    b: 2
  }
})
```

携带到`url`当中，所以下边我们就来实现将`params`携带到`get`请求当中的功能。

### 处理params选项-url请求参数

- 目标：将`axios`配置选项`config`中的`params`选项同`url`选项绑定起来

- 要求：

  - 对于值为 `null` 或者 `undefined` 的属性，直接忽略，不会绑定到`url`上边。

    ```ts
    axios({
      method: 'get',
      url: '/base/get',
      params: {
        foo: 'bar',
        baz: null
      }
    })
    ```

    以上的请求`url`最终会是`/base/get?foo=bar`

  - 对于`url`，如果`url`上带有哈希值，要去除掉`url`上的哈希值

    ```ts
    axios({
      method: 'get',
      url: '/base/get#hash',
      params: {
        foo: 'bar'
      }
    })
    ```

    以上的请求`url`最终会是`/base/get?foo=bar`

  - 对于`'@', ':', '$', ',', ' ', '[', ']' `这七个特殊字符串都是需要保留的，不需要被转义的encode。

    ```ts
    axios({
      method: 'get',
      url: '/base/get',
      params: {
        foo: '@:$, '
      }
    })
    ```

    以上请求的`url`最终会是`/base/get?foo=@:$+`(空格会转成+号)

  - 对于`url` 中已存在的参数，则保留，直接添加到`url`后边

    ```ts
    axios({
      method: 'get',
      url: '/base/get?foo=bar',
      params: {
        bar: 'baz'
      }
    })
    ```

    以上请求的`url`最终会是`/base/get?foo=bar&bar=baz`

  - 对于params中的属性值，如果是参数值为 Date 类型的话，需要获取到date.toISOString()的结果，再绑定到url后边。

    ```ts
    axios({
      method: 'get',
      url: '/base/get',
      params: {
        date: new Date()
      }
    })
    ```

    以上请求的url最终会是`/base/get?date=2019-04-01T05:55:39.030Z`

  - 对于params中的属性值，如果参数值为普通对象的话，则需要获取到encode后的结果。

    ```ts
    axios({
      method: 'get',
      url: '/base/get',
      params: {
        foo: {
          bar: 'baz'
        }
      }
    })
    ```

    以上请求的url最终会是`/base/get?foo=%7B%22bar%22:%22baz%22%7D`

  - 对于params中的属性值，如果参数值为数组的话，则需要将`foo`先变成`foo[]`，然后依次将数组的每一个元素包装成`foo[]=val`的形式最后用`&`连接起来绑定到url上。

    ```ts
    axios({
      method: 'get',
      url: '/base/get',
      params: {
        foo: ['bar', 'baz']
      }
    })
    ```

    以上请求的`url`最终会 是 `/base/get?foo[]=bar&foo[]=baz'`

- 实现

  我们希望把项目中的一些工具函数、辅助方法独立管理，于是我们创建一个 `helpers` 目录，在这个目录下创建 `url.ts` 文件，未来会把处理 `url` 相关的工具函数都放在该文件中。

  `src/helpers/url.ts`

  ```ts
  import { isEmpty, isArray, isDate, isObject, encode } from './util'
  /**
   * 绑定params到url上
   * @param url
   * @param params
   * @returns string
   */
  export default function bindURL(url: string, params?: any): string {
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
        } else if (isObject(val)) {
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
  ```

  `src/helpers/util.ts`

  ```ts
  
  const toString = Object.prototype.toString
  
  /** 是否为空 */
  export const isEmpty = (val:any) :boolean => val === null || typeof val === undefined
  
  /** 是否是数组类型 */
  export const isArray = (val:any) :val is Array<any>  => Array.isArray(val)
  
  /** 是否是时间类型 */
  export const isDate = (val:any) :val is Date => toString.call(val) === '[object Date]'
  
  /** 是否是引用类型 */
  export const isObject = (val:any) :val is Object => val!==null && typeof val === 'object'
  
  export const encode = (val:string) :string => {
    val = encodeURIComponent(val) /** 先将val直接转义 */
    val = val.replace(/%40/g, '@') /** 从转义的val中将特殊字符‘@’还原 */
    val = val.replace(/%3A/ig, ':') /** 从转义的val中将特殊字符‘:’还原 */ /**所有带字母的匹配都需要i忽略大小写 */
    val = val.replace(/%24/g, '$') /** 从转义的val中将特殊字符‘$’还原 */
    val = val.replace(/%2C/ig, ',') /** 从转义的val中将特殊字符‘,’还原 */
    val = val.replace(/%20/g, '+') /** 从转义的val中将特殊字符‘空格’转换成+号 */
    val = val.replace(/%5B/ig, '[') /** 从转义的val中将特殊字符‘[’还原 */
    val = val.replace(/%5D/g, ']') /** 从转义的val中将特殊字符‘]’还原 */
    return val
  }
  ```

### 处理data选项-url请求的body数据

- 目标：正确处理axios中的data

- 相关：https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send

- 实现

  `src/helper/data.ts`

  ```ts
  import { isPlainObject } from './util'
  
  /** 对axios config中的data做处理 - 处理普通对象 */
  const  transformRequest = (data:any) :any => { /** 叫做transformRequest,是因为发出请求前会对data处理，接收响应后也会对data处理，叫这个名字统一 */
    /** 对于FormData, Blob, ArrayBuffer这些类型不需要做转换，xhr.send(data)中的data是可以允许这些类型传递的 */
    /** 我们只需要对axios传入的普通对象做处理 */
    if(isPlainObject(data)) return JSON.stringify(data) /** 是普通对象的话直接序列化反回 */
    return data /** 否则直接返回data，此时data啥类型直接原样返回啥类型 */
  }
  
  
  export default transformRequest
  ```

  `src/helper/util.ts`

  ```ts
  /** 是否是一个普通对象 */
  export const isPlainObject = (val:any) :val is Object => toString.call(val) === '[object Object]'
  ```

  `src/index.ts`

  ```ts
  ...
  import transformRequest from './helpers/data'
  import { AxiosRequestConfig } from './types'
  import xhr from './xhr'
  
  function axios(config: AxiosRequestConfig):void {
    processConfig(config) /** 处理config */
    ...
  }
  
  /** 处理请求配置 */
  function processConfig(config: AxiosRequestConfig) :void {
    ...
    config.data = transformRequestData(config) /** 转换请求axios的data */
  }
  
  /** 处理请求data，将data转换成符合xhr.send(body)符合body要求的格式 */
  function transformRequestData(config: AxiosRequestConfig) :string {
    const { data } = config
    return transformRequest(data)
  }
  export default axios
  ```

  最后在进行demo测试的时候，我们发现虽然data都正确发送出去了，但是请求的时候，对于对象序列化后的data发送出去的请求对应的响应返回来是一个空对象。这是因为我们并没有对http请求的Content-Type进行正确处理的原因，此时是text/plain类型，所以导致了后端返回的是一个空对象。下边我们就来处理Content-Type，将发送的data格式跟正确的Content-Type对应起来。

### 处理Content-Type - 设置正确的Header头部

- 目标：正确处理axios配置中的headers选项和对xhr发送网络请求的时候设置正确的header头部

- 实现

  `src/helpers/headers.ts`

  ```ts
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
  ```

  `src/helpers/util.ts`

  ```ts
  /** 规范化headers头部的书写 - headers就是config中设置的headers */
  export const normalizedHeaderName = (headers:any, normalizedName: string): any => {
    Object.keys(headers).forEach((headerName) => {
      if(headerName !== normalizedName && headerName.toUpperCase() === normalizedName.toUpperCase()){
        headers[normalizedName] = headers[headerName] /** 如果用户在config中设置headers的时候对于大小写写错，在这里处理成规范化的名字 */
        Reflect.deleteProperty(headers, headerName) /** 有了规范化的键后就可以删除headers中不规范的键了 */
      }
    })
    return headers
  }
  ```

  `src/index.ts`

  ```ts
  function axios(config: AxiosRequestConfig):void {
    processConfig(config) /** 处理config */
    xhr(config) /** 将处理后的config传入xhr函数，发送请求 */
  }
  
  /** 处理请求配置 */
  function processConfig(config: AxiosRequestConfig) :void {
    ...
    config.headers = transformHeaders(config) /** 转换axios的headers - 设置正确请求头 - 必须在data之前，因为先处理了data的话，普通对象直接变json字符串内部逻辑就没效果了 */
    config.data = transformRequestData(config) /** 转换axios的data */
  }
  
  ...
  
  /** 处理请求header， 将header设置成符合xhr.setRequestheader的正确格式 */
  function transformHeaders(config: AxiosRequestConfig) :string {
    const { headers = {}, data } = config /** 因为headers可选，为了防止用户不传递这里给一个空对象 */
    return processHeader(headers, data)
  }
  export default axios
  ```

  `src/xhr.ts`

  ```ts
  import { AxiosRequestConfig } from './types'
  import { setRequestHeader } from './helpers/util'
  
  export default function xhr(config: AxiosRequestConfig):void {
    const { url, method = 'get', data = null, headers } = config /** 这里headers不用给默认值，因为一定有值，最少都是一个空对象 */
    const request = new XMLHttpRequest()
    /** 开启一条请求连接：请求方法大写 - url - true是异步的意思 */
    request.open(method.toUpperCase(), url,  true)
    /** 设置请求header头部 */
    setRequestHeader(request, headers, data)
    request.send(data)
  }
  ```

  `src/helpers/util.ts`

  ```ts
  /**
   * 设置xhr请求header
   * @param request 
   * @param headers 
   * @param data 
   */
   export const setRequestHeader = (request: XMLHttpRequest, headers: Object, data: any) => {
    Object.entries(headers).forEach(([header, value])=> {
      /** 处理意外情况：如果data都没有，同时又在配置headers中设置了content-type,那么直接删除掉这个头部 */
      if(!data && header.toLocaleLowerCase() === 'content-type') return Reflect.deleteProperty(headers, header)
      request.setRequestHeader(header, value)
    })
  }
  ```

### 处理服务端返回的响应

- 目标：能够在代码层面正确处理服务端返回的响应

- 实现

  `src/types/index.ts`

  ```ts
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
  ```

  `src/helpers/util.ts`

  ```ts
  /**
   * 监听xhr响应并处理返回值
   * @param request 
   * @param responseType 
   * @param config 
   */
  export const handleReadyStateChange = (request: XMLHttpRequest, responseType: XMLHttpRequestResponseType, config: AxiosRequestConfig, resolve:Function) => {
    request.onreadystatechange = function handleLoad () {
      if(request.readyState !== 4) return 
      /** 否则就是为4的成功的状态 */
      /** 获取响应数据 */
      const { status, statusText } = request
      const data = responseType !== 'text' ? request.response : request.responseText
      /** 获取响应头部 */
      const headers = request.getAllResponseHeaders()
      const axiosResponse: AxiosResponse = {
        data,
        status,
        statusText,
        headers,
        config,
        request
      }
      resolve(axiosResponse)
    }
  }
  ```

  `src/xhr.ts`

  ```ts
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
  ```

  `src/index.ts`

  我们将返回值替换成AxiosPromise

  ```ts
  function axios(config: AxiosRequestConfig):AxiosPromise {
    processConfig(config) /** 处理config */
    return xhr(config) /** 将处理后的config传入xhr函数，发送请求 */
  }
  ```

- 遗留问题： 以上实现过后，我们已经能够在代码层面上进行数据响应的基本处理了。但是我们发现对于返回的数据如果是json格式的情况下，如果请求的时候没有传递responseType:'json'的话，返回的是一个json字符串而不是解析后的对象。另外一个问题是对于headers我们发现也是一个json字符串，我们更希望拿到的是一个解析后的对象，下边我们就将这些遗留的问题解决。

