/**
 * Created by huangjiajia on 2017/1/14.
 * Description: 挂载中间件
 * 用来给中间件或整个程序定义一个路径前缀
 * 例如：
 * 如果一个中间件组件或服务器挂载到了/blog上，代码中/article/1的req.url通过客户端
 * 来访问就是/blog/article/1。这中分离意味着你可以在多个地方重用博客服务器，
 * 不用为不同的访问源修改代码。比如说，如果你决定改用/articles(/articles/article/1)
 * 提供文章服务，不再用/blog，只要修改挂载路径前缀就可以了
 */

var connect = require('connect');

connect()
    .use(logger)
    .use('/admin', restrict)
    .use('/admin', admin)
    .use(hello)
    .listen(3000, function () {
        console.log('Server is listening from port 3000');
    });

function logger (req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
}

function hello (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!');
}

/**
 * Basic认证逻辑
 * 借助带着Base64编码认证信息的HTTP请求头中的authorization字段进行认证
 * 中间件组件解码认证信息，检查用户名和密码的正确性。如果有效，这个组件会调用 next() ，
 * 表明这个请求没有问题，可以继续处理，否则它会抛出一个错误
 */

function restrict(req, res, next) {
    var authorization = req.headers.authorization;

    if(!authorization) {
        return next(new Error('Unauthorized'));
    }

    var parts  = authorization.split(' ');
    var scheme = parts[0];
    var auth   = new Buffer(parts[1], 'base64').toString().split(':');
    var user   = auth[0];
    var pass   = auth[1];

    // 根据数据库中的记录检查认证信息的函数
    authenticateWithDatabase(user, pass, function (err) {

        // 告诉分派器出错了
        if(err) {
            return next(err);
        }

        // 如果认证信息有效，不带参数调用next()
        next();
    });
}

function admin(req, res, next) {
    switch (req.url) {
        case '/':
            res.end('try /users');
            break;
        case '/users':
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(['tobi','loki', 'jane']));
            break;
    }
}
