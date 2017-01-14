/**
 * Created by huangjiajia on 2017/1/14.
 * Description: http请求
 *
 * POST:
 * 1. 分派器收到请求，把它传给第一个中间件
 * 2. 请求日志logger，并使用next()传给下一个中间件
 * 3. 如果有，请求体会被解析，并用next()传给下一个中间件
 * 4. 如果请求的是静态文件，用那个文件做响应，不再调用next(),否则请求进入下一个中间件
 * 5. 请求被一个定制的中间件处理好，响应结束
 *
 * GET:
 * 1. 分派器收到请求，把它传给第一个中间件
 * 2. 记录请求日志，并用next()传给下一个中间件
 * 3. 如果有，请求体会被解析，并用next()传给下一个中间件
 * 4. 如果请求的是静态文件，用那个文件做响应，不再调用next(),res.end()
 */

/**
 * Description: 最小的Connect程序，没有中间件
 * 使用浏览器发送一个HTTP请求，看出现'Cannot GET/',
 * 表明这个程序还不能处理请求的URL。

    var connect = require('connect');
    var app     = connect();

    app.listen(3000);

 */

/**
 * Description: 在Connect中，中间件是一个js函数，按照惯例会接受三个参数：
 * 一个请求对象，一个响应对象，一个通常命名为next的参数，它是一个回调函数，
 * 表明这个组件已经完成了他的工作，可以执行下一个中间件组件了
 */

var connect = require('connect');
var app     = connect();

/**
 * .use()返回的是支持方法链的Connect程序实例
 * 中间件调用顺序很重要，当一个组件不嗲用next()时，命令链的后续中间件都不会被调用
 */

app.use(logger).use(hello);

app.listen(3000, function () {
    console.log('Server is listening from port 3000');
});

/**
 * Description: 输出日志的中间件  --- 中间件1
 * @param req
 * @param res
 * @param next
 */
function logger(req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
}

function hello(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!');
}
