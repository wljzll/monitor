// 往服务器上发送数据
let host = 'cn-shanghai.log.aliyuncs.com';
let project = 'slefmonitor';
let logStroe = 'selfmonitor-store';
let userAgent = require('user-agent');

function getExtraData() {
    return {
        title: document.title,
        url: location.href,
        timestamp: Date.now(),
        userAgent: userAgent.parse(navigator.userAgent).name
    }
}
class SendTracker {
    constructor() {
        this.url = `http://${project}.${host}/logstores/${logStroe}/track`;
        this.xhr = new XMLHttpRequest;
    }
    send(data = {}) {
        let extraData = getExtraData();
        let log = {...data, ...extraData };
        this.xhr.open('POST', this.url, true);

        // 接口的值不能是数字
        for (const key in log) {
            if (typeof log[key] === 'number') {
                log[key] = `${log[key]}`
            }
        }
        let body = JSON.stringify({
            '__logs__': [log]
        })
        this.xhr.setRequestHeader('x-log-apiversion', '0.6.0'); // 版本号
        this.xhr.setRequestHeader('x-log-bodyrawsize', body.length); // 请求体的大小
        this.xhr.setRequestHeader('Content-Type', 'application/json'); // 请求体的类型

        this.xhr.onload = function() {

        }
        this.xhr.onerror = function(error) {

        }
        console.log('本次上报的日志', log)
        this.xhr.send(body);
    }
}

export default new SendTracker();