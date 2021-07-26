import tracker from '../utils/tracker';
export function injectXHR() {
    let XMLHttpRequest = window.XMLHttpRequest;
    // 劫持原XMLHttpRequest的open方法
    let oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
        // 排除上报阿里云仓库和webpack日志两个接口的上报 如果不排除阿里云日志仓库的接口上报，会死循环
        if (!url.match(/logstores/) && !url.match(/sockjs/)) {
            // 将一些信息挂载到实例的logData上
            this.logData = {
                method, // 请求方式
                url, // 请求的url
                async, // 同步异步请求
                username, // 用户名
                password // 密码
            }
        }
        // 最终还是应用劫持的open方法
        return oldOpen.apply(this, arguments);
    }

    // 劫持原XMLHttpRequest的send方法
    let oldSend = XMLHttpRequest.prototype.send;
    // send时的时间戳
    let start;
    XMLHttpRequest.prototype.send = function(body) {
        if (this.logData) {
            // 获取当前的时间戳
            start = Date.now();
            let handler = (type) => (event) => {
                // 保存从本次请求发出到本次请求结束的时间间隔
                let duration = Date.now() - start;
                // 本次xhr的状态
                let status = this.status;
                // 本次xhr的statusText
                let statusText = this.statusText;
                // 上报本次xhr的日志
                tracker.send({ //未捕获的promise错误
                    kind: 'stability', //稳定性指标
                    type: 'xhr', //xhr
                    eventType: type, //load error abort
                    pathname: this.logData.url, //接口的url地址
                    status: status + "-" + statusText,
                    duration: "" + duration, //接口耗时
                    response: this.response ? JSON.stringify(this.response) : "",
                    params: body || ''
                })
            };
            // 监听本次xhr的load事件
            this.addEventListener('load', handler('load'), false);
            // 监听本次xhr的error事件
            this.addEventListener('error', handler('error'), false);
            // 监听本次xhr的abort事件
            this.addEventListener('abort', handler('abort'), false);
        }
        // 最终还是调用劫持的send方法请求接口
        oldSend.apply(this, arguments);
    };
}