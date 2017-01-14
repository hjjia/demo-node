/**
 * Created by huangjiajia on 2017/1/13.
 * Description: 从表单中接受用户输入
 *
 * 表单提交请求带的Content-Type值通常有两种
 * 1. application/x-www-form-urlencoded 这是HTML表达那的默认值
 * 2. multipart/form-data 在表单中含有文件或非ASCII或二进制数据时使用
 *
 * 设定Content-Length头
 * 为了提高响应速度，如果可能的话，应该在响应中带着Content-Length域一起发送。
 * 对于事项清单而言，响应主体很容易在内存中提前构建好，所以能够字符串的长度
 * 并一次性地将整个清单发出去。设定Content-Length域会隐含禁用Node的块编码，
 * 因为要传输的数据更少，所以能提升性能
 *
 * 可以使用body.length的值设定Content-Length,但Content—Length的值应该是字节长度
 * 不是字符串长度，并且如果字符串中有多字节字符，两者长度是不一样的，为了规避这个问题
 * Node 提供了一个Buffer.byteLength()方法
 */

/*
 * 所有不是'/'的URL都会得到404 Not Found响应
 * 所有非GET或POST的HTTP谓词请求都会得到400 Bad Request响应
 */
var http = require('http');
var items = [];
var server = http.createServer(function (req, res) {
    if('/' == req.url) {
        console.log(req.url);

        switch (req.method) {
            case 'GET':
                show(res);
                break;
            case 'POST':
                add(req, res);
                break;
            default:
                badRequest(res);
        }
    }
    else {
        notFound(res);
    }
});

server.listen(3000, function () {
   console.log('Server is listening form port 3000');
});

function show(res) {
    var html = '<html><head><title>Todo List</title></head><body>'
        + '<h1>Todo List</h1>' +
        '<ul>' +
        items.map(function (item) {
            return '<li>' + item + '</li>';
        }).join('') +
        '</ul>' +
        '<form method="post" action="/">' +
        '<p><input type="text" name="item"></p>' +
        '<p><input type="submit" value="Add Item"/></p>' +
        '</form></body>';

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(html);
}

function notFound(res) {
    res.setStatusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
}

function badRequest (res) {
    res.setStatusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Bad Request');
}

var qs = require('querystring');
function add(req, res) {
    var body = '';

    req.setEncoding('utf8');

    req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        var obj = qs.parse(body);

        items.push(obj.item);
        show(res);
    });
}
