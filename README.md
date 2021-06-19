### 定义类型约束

`types/index.ts`: 项目中所有公共的类型定义文件

为了约束传入axios的config配置对象，我们使用了接口定义了config的相关约束条件。

```ts
 export interface AxiosRequestConfig {
  url: string, /** url是必须要传递的参数 */
  method?: string, /** method可选，因为默认会给‘get' */
  data?: any, /** data可选 */
  params?: any /** params可选 */
}
```

虽然我们定义了method的的具体类型，但是对于method选项，我们需要进一步严格限制，因为method并不是任意可以选择的字符串，它应该符合http method的要求。所以，接下来，我们要进一步定义method的类型。由于method的取值在可选的范围内，所以我们可以使用type定义一个method的类型。

```ts
/** config中method选项的类型约束 */
export type Method = 
'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'|
'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH'
```

然后我们将AxiosRequestConfig中的method选项替换如下

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

以上我们定义了xhr函数，并且对传入配置`config`进行了类型的约束。在函数体里头，我们对`config`配置进行了解构。由于在定义类型的时候，`url`一定是一个毕传的选项，所以在解构的时候我们并不需要担心传入为空。而对于`method`和`data`我们在定义的时候是允许传入为空的，所以在这个地方解构的时候，我们赋予`method`和`data`默认值。对于`method`我们默认是`get`请求，对于`data`因为我们会使用到`XMLHttpRequest`对象，发送的时候对于`get`发送的`data`就是空值，所以赋予了`null`。

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

我们在`examples`目录下存放的是项目的demo文件，用来测试我们写的axios库。`examples/simple`目录下存放的是以上书写的axios的测试文件。启动devserver之后，我们点击`simple`链接，打开控制台可以发现已经发送出去了一条`get`请求，响应也是成功了的。但是，就目前来说，我们的项目中测试的代码是这样的

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

在浏览器的Network面板中，我们会发现请求的url却是这样子的：

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

携带到url当中，所以下边我们就来实现将params携带到get请求当中的功能。
