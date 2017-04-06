/*
  asap作用
      确定异步调用的方式(promcess.nextTick, mutationObserver, setTimeout等)
      维护一个回调的quene

      每次调用asap 往队列中加入callback, args
      当quene length == 2 时 调用flush执行回调quene中的方法

      支持自定义的flush 和 异步调用方式设定
 */
let len = 0;
let vertxNext;
let customSchedulerFn;

export var asap = function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
            customSchedulerFn(flush);
        } else {
            scheduleFlush();
        }
    }
};

/*
  自定义异步调用方式
 */
export function setScheduler(scheduleFn) {
    customSchedulerFn = scheduleFn;
}

export function setAsap(asapFn) {
    asap = asapFn;
}
/* end */

const browserWindow = (typeof window !== 'undefined') ? window : undefined;
const browserGlobal = browserWindow || {};
const BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
const isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
const isWorker = typeof Uint8ClampedArray !== 'undefined' &&
    typeof importScripts !== 'undefined' &&
    typeof MessageChannel !== 'undefined';

/*
  异步方式的选择
    - node      process.nexttick
    - vertx
    - mutationObserver
    - messageChannel
    - default   setTimeout

    浏览器中使用 mutationObserver居多
    mutationObserver:
        Chrome 49      |    Safari 10
        IE 11          |    Firefox 51
        IOS Safari 9.3 |    Opera 43
        Andriod 4.4    |    ChromeForAndriod 57
*/

/*
  node
  condition: isNode
*/
function useNextTick() {
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // see https://github.com/cujojs/when/issues/410 for details
    return () => process.nextTick(flush);
}

/*
  vertx
  condition: browserWindow === undefined && typeof require === 'function'
*/
function useVertxTimer() {
    if (typeof vertxNext !== 'undefined') {
        return function() {
            vertxNext(flush);
        };
    }

    return useSetTimeout();
}

function attemptVertx() {
    try {
        const r = require;
        const vertx = r('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
    } catch (e) {
        return useSetTimeout();
    }
}

/*
  mutationObserver
  condition: BrowserMutationObserver
*/
function useMutationObserver() {
    let iterations = 0;
    const observer = new BrowserMutationObserver(flush);
    const node = document.createTextNode('');
    observer.observe(node, {
        characterData: true
    });

    return () => {
        node.data = (iterations = ++iterations % 2);
    };
}

/*
  messageChannel
  condition: isWorker
*/
function useMessageChannel() {
    const channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return () => channel.port2.postMessage(0);
}

// default use setTimeout
function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    const globalSetTimeout = setTimeout;
    return () => globalSetTimeout(flush, 1);
}

/* end of async way */



/* callback的quene */
// 存储方式[callback1, args2, callback2, args2, ...]

// 预先申请 len 1000的quene
// 现实中往往用不了这么多。Promise占用资源过多(慢?)的原因之一
const queue = new Array(1000);

function flush() {
    for (let i = 0; i < len; i += 2) {
        let callback = queue[i];
        let arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
    }

    len = 0;
}



let scheduleFlush;
// Decide what async method to use to triggering processing of queued callbacks:

if (isNode) {
    scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
} else if (isWorker) {
    scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertx();
} else {
    scheduleFlush = useSetTimeout();
}
