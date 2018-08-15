/*!
 *  nekyErr v1.0.0 By suguangwen
 *  Github: https://github.com/suguangwen/neky-err
 *  MIT Licensed.
 */
;(function (root, nekyErr) {
    
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = nekyErr
    else if(typeof define === 'function' && define.amd)
        define([], nekyErr)
    else if(typeof exports === 'object')
        exports["nekyErr"] = nekyErr
    else
        root["nekyErr"] = nekyErr
    
    if (window) window.nekyErr = nekyErr

})(this, function(configData) {

    if (!configData) return
    
    let { method, url, isSampling, addErrData } = configData || {}

    const Config = {
        method: method && method == 'GET' ? 'GET' : 'POST',
        url: url || '',
        isSampling: isSampling === false ? false : true,
        addErrData: addErrData
    }

    const allErrorData = []

    const nekyErr = {
        XMLHttpRequest: XMLHttpRequest,
        message: {
            JSERR: {
                code: '01',
                msg: 'JS异常',
            },
            EVENTERR: {
                code: '01',
                msg: '静态资源加载异常',
            },
            AJAXERR: {
                code: '02',
                msg: 'AJAX请求异常',
            },
            AJAXTIMEOUTERR: {
                code: '03',
                msg: 'AJAX请求超时',
            },
        }
    }

    //json转换成URL格式
    let parseParam =  function (param, key) {
        var paramStr = "";
        if ( typeof param ==  'string' || typeof param == 'number' || typeof param == 'boolean') {
            paramStr += "&" + key + "=" + encodeURIComponent(param);
        } else {
            for (let i in param) {
                var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
                paramStr += '&' + parseParam(param[i], k);
            }
        }
        return paramStr.substr(1) + '';
    };

    //错误信息提取
    let stackMsg = function (error) {
        let stack = error.stack
            .replace(/\n/gi, "")
            .split(/\bat\b/)
            .slice(0, 9)[1]
        let msg = error.toString()
        return {
            errMsg: msg,
            errUrl: stack
        }
    }
    
    //错误信息组合
    let errorData = function (errorData) {

        let {errMsg, errUrl, errType} = errorData
        let errData = {
            errMsg: errMsg,
            errUrl: errUrl,
            errIndex: window.location.href,
            errType: errType,
            errTime: new Date().getTime(),
            errAgent: window.navigator.userAgent,
            errCode: errMsg + ',' + errUrl,
            addErrData: {}
        }

        if (addErrData && isPlainObject(addErrData)) {
            for (let i in addErrData) {
                errData.addErrData[i] = addErrData[i]
            }
        }

        return errData

    }

    //判断错误信息是否重复
    let sampling = function (data) {
        if (Config.isSampling) {
            if (allErrorData.indexOf(data.errCode) != -1) {
                return true
            } else {
                allErrorData.push(data.errCode)
                return false
            }
        } else {
            return false
        }

    }

    //是否为简单对象,常用于判断是否为JSON
    let isPlainObject = function (value) {
        if (value === null || value === undefined) return false
        return isObject(value) && value.__proto__ === Object.prototype
    }

    //是否对象
    let isObject = function (value) {
        return typeof value != null && (typeof value == 'object' || typeof value == 'function')
    }

    //错误内容处理
    nekyErr.errorHandler = function (error) {

        if (sampling(error)) return

        var xhr = new XMLHttpRequest();
        
        if (Config.method == 'POST') {
            xhr.open(Config.method, Config.url, true)
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.send(JSON.stringify(error));
        } else {
            xhr.open(Config.method, Config.url + '?' + parseParam(error), true)
            xhr.send(null);
        }
        
    }

    //异常监控API,可以用于主动监控被捕获的JavaScript异常。
    nekyErr.error = function (error) {

        let errData = {}
        if (error && error.stack) {
            errData = stackMsg(error)
        }

        nekyErr.errorHandler(errorData({
            errMsg: errData.errMsg, 
            errUrl: errData.errUrl,
            errType: nekyErr.message.JSERR
        }));
    }

    //全局的onError函数，可以搜集页面上的错误信息,但是有的浏览器不支持该方法
    window.onerror = (msg, url, line, col, err) => {

        let errData = {}
        if (err && err.stack) {
            errData = stackMsg(err)
        }

        nekyErr.errorHandler(errorData({
            errMsg: errData.errMsg, 
            errUrl: errData.errUrl,
            errType: nekyErr.message.JSERR
        }));
    }

    //Promise 的 reject 但是没有被 catch 捕捉时触发，可获取异常信息。
    window.onunhandledrejection = event =>{

        let errData = {}
        if (event && event.reason) {
            errData = stackMsg(event.reason)
        }

        nekyErr.errorHandler(errorData({
            errMsg: errData.errMsg, 
            errUrl: errData.errUrl,
            errType: nekyErr.message.JSERR
        }));

    };

    //监听静态资源加载错误
    window.addEventListener('error', function(event) {

        let errorTarget = event.target

        if (errorTarget && errorTarget.baseURI) {
            nekyErr.errorHandler(errorData({
                errMsg: errorTarget.outerHTML, 
                errUrl: errorTarget.baseURI,
                errType: nekyErr.message.EVENTERR
            }));
        }

    }, true)

    //页面AJAX请求类型判断
    nekyErr.XMLTYPE = function (event) {
        let target = event.target

        if ("readystatechange" === event.type ) {
            // console.log('请求状态码改变')
            if (target.readyState == 4) {
                if (target.status == 404) {
                    nekyErr.errorHandler(errorData({
                        errMsg: '错误码：' + event.target.status, 
                        errUrl: target.responseURL,
                        errType: nekyErr.message.AJAXERR
                    }));
                }
            }
        }

        // if ("loadstart" === event.type ) {
        //     console.log('请求开始')
        // }

        // if ("loadend" === event.type ) {
        //     console.log('请求结束')
        // }

        // if ("progress" === event.type ) {
        //     console.log('请求进度')
        // }
        // if ("load" === event.type ) {
        //     console.log('请求加载')
        // }
        // if ("abort" === event.type ) {
        //     console.log('请求中止')
        // }


        if ("error" === event.type ) {
            // console.log('请求出错')
            nekyErr.errorHandler(errorData({
                errMsg: '错误码：' + event.target.status, 
                errUrl: target.responseURL,
                errType: nekyErr.message.AJAXERR
            }));
        }

        if ("timeout" === event.type ) {
            // console.log('请求超时')
            nekyErr.errorHandler(errorData({
                errMsg: '错误码：' + event.target.status, 
                errUrl: target.responseURL,
                errType: nekyErr.message.AJAXTIMEOUTERR
            }));
        }

    }

    //监听页面所有AJAX请求
    window.XMLHttpRequest = function () {

        let XML = new nekyErr.XMLHttpRequest

        XML.addEventListener("readystatechange", nekyErr.XMLTYPE)
        XML.addEventListener("error", nekyErr.XMLTYPE)
        XML.addEventListener("timeout", nekyErr.XMLTYPE)
        XML.addEventListener("loadstart", nekyErr.XMLTYPE)
        XML.addEventListener("loadend", nekyErr.XMLTYPE)

        return XML
       
        
    };

    
    return nekyErr
});