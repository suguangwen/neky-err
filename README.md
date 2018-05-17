# neky-err
Front end anomaly capture.

前端异常捕捉。

# 安装//Install

```npm
npm install neky-utils --save
```

### ES6

```JavaScript
import nekyErr from 'neky-err'

```

### CommonJS

```JavaScript
var nekyErr =  require('neky-err');

```

### 直接引用//Direct include

```JavaScript
<script src="../node_modules/neky-err/src/index.js"></script>
```

# 使用方法//Usage

```JavaScript
    let nekyError = nekyErr({ 
        url: 'http://localhost:8800/', //接收报错信息地址
        method: 'GET', //请求类型 post/get 默认为post
        isSampling: true, //是否采样，本地错误信息会存储在本地，同样的错误不会多次发送请求 true / false 默认为true
        addErrData: {}, //附加的数据，该数据会与报错信息一起传给后端，可用于记录一些业务数据
    })
```

# 错误数据/errData

```JavaScript
    errMsg: '', //异常信息内容
    errUrl: errUrl, //异常文件路径
    errIndex: window.location.href, //发生异常的页面
    errType: errType, // 异常类型
    errTime: new Date().getTime(), // 捕捉到异常的时间
    errAgent: window.navigator.userAgent, // 客户端信息
    errCode: '', // 错误信息组合的Code,后端可以通过查看这个errCode是否存在, 来确认该报错信息是否需要保存。
    addErrData: {} // 自定义错误数据，该数据会与报错信息一起传给后端，可用于记录一些业务数据
```

# API

```JavaScript
    nekyError.error(err) //接收一个参数为错误信息，可以用于主动监控被捕获的JavaScript异常。
```


# License

MIT