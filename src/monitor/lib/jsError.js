import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
import tracker from "../utils/tracker";
export function injectJsError() {
    // 监听全局未捕获的错误：包括执行JS时的各种语法错误以及资源加载错误
    window.addEventListener('error', function(event) { // 错误事件对象
        console.log('error', event);
        let lastEvent = getLastEvent(); // 获取最后一个交互事件
        // 这是加载脚本时报的错
        if (event.target && (event.target.src || event.target.href)) {
            tracker.send({
                kind: 'stability', // 监控指标的大类
                type: 'error', // 小类型 这是一个错误
                errorType: 'resourceError', // JS执行错误
                url: '', // 访问哪个路径报的错
                // message: event.message, // 报错信息
                filename: event.target.src || event.target.href, // 哪个文件报错了
                tagName: event.target.tagName, // SCRIPT
                selector: getSelector(event.target), // 代表最后一个操作的元素
            }, true);

        } else {
            tracker.send({
                kind: 'stability', // 监控指标的大类
                type: 'error', // 小类型 这是一个错误
                errorType: 'jsError', // JS执行错误
                url: '', // 访问哪个路径报的错
                message: event.message, // 报错信息
                filename: event.filename, // 哪个文件报错了
                position: `${event.lineno}:${event.colno}`,
                stack: getLines(event.error.stack),
                selector: lastEvent ? getSelector(lastEvent.path) : '', // 代表最后一个操作的元素
            }, true);
        }


    }, true);

    // 捕获promise未通过catch或者失败的回调函数处理的错误
    window.addEventListener('unhandledrejection', function(event) {
        console.log(event);
        let lastEvent = getLastEvent();
        let message;
        let filename;
        let line = 0;
        let column = 0;
        let stack = '';
        let reason = event.reason;
        if (typeof reason === 'string') {
            message = reason;
        } else if (typeof reason === 'object') {
            if (reason.stack) {
                let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
                filename = matchResult[1];
                line = matchResult[2];
                column = matchResult[3];
            }
            message = reason.message
            stack = getLines(reason.stack);
        }
        tracker.send({
            kind: 'stability', // 监控指标的大类
            type: 'error', // 小类型 这是一个错误
            errorType: 'promiseError', // JS执行错误
            url: '', // 访问哪个路径报的错
            message, // 报错信息
            filename: filename, // 哪个文件报错了
            position: `${line}:${column}`,
            stack,
            selector: lastEvent ? getSelector(lastEvent.path) : '', // 代表最后一个操作的元素
        }, true)
    }, true);
    /**
     * @description 将栈信息字符串处理成我们想要的格式
     * @param {*} stack JS错误的栈信息
     * @returns 处理过后我们想要的格式的字符串
     * "errorClick (http://localhost:8080/:20:34)^HTMLInputElement.onclick (http://localhost:8080/:14:74)"
     */
    function getLines(stack) {
        return stack.split('\n').slice(1).map(item => item.replace(/^\s+at\s+/g, "")).join('^')
    }
}