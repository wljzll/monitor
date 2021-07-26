import tracker from '../utils/tracker';
import onload from '../utils/onload';
// elementsFromPoint方法可以获取到当前视口内指定坐标处，由里到外排列的所有元素 第一个元素是坐标处的最底层的元素
// [div.content div#container body html] 格式是这种

// 将传入的DOM元素处理成 字符串形式：#container
function getSelector(element) {
    var selector;
    if (element.id) {
        selector = `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
        selector = '.' + element.className.split(' ').filter(function(item) { return !!item }).join('.');
    } else {
        selector = element.nodeName.toLowerCase();
    }
    return selector;
}
export function blankScreen() {
    // 这是我们写死的数组 所以不适合所有的项目
    const wrapperSelectors = ['body', 'html', '#container', '.content'];
    // 统计我们统计的18个点中有多少是空白点
    let emptyPoints = 0;

    function isWrapper(element) {
        // 处理DOM元素格式
        let selector = getSelector(element);
        // 判断当前点位的元素是否存在于wrapperSelectors中，如果存在则说明这个点是空白点
        if (wrapperSelectors.indexOf(selector) >= 0) {
            // 空白点统计+1
            emptyPoints++;
        }
    }
    // 在页面DOM加载完成以后再去统计
    onload(function() {
        let xElements, yElements;
        // 以页面的中心点为坐标轴的x/y轴上分别划分九个点，判断这18个点是否为空白点
        for (let i = 1; i <= 9; i++) {
            xElements = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight / 2)
            yElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / 10)
            isWrapper(xElements[0]);
            isWrapper(yElements[0]);
        }
        // 如果空白点存在，上报
        if (emptyPoints >= 0) {
            let centerElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
            tracker.send({
                kind: 'stability',
                type: 'blank',
                emptyPoints: "" + emptyPoints,
                screen: window.screen.width + "x" + window.screen.height,
                viewPoint: window.innerWidth + 'x' + window.innerHeight,
                selector: getSelector(centerElements[0]),
            })
        }
    });
}
//screen.width  屏幕的宽度   screen.height 屏幕的高度
//window.innerWidth 去除工具条与滚动条的窗口宽度 window.innerHeight 去除工具条与滚动条的窗口高度