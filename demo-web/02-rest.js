/**
 * Created by huangjiajia on 2017/1/12.
 */
var http = require('http');
var url  = require('url');
var items = [];

var server = http.createServer(function (req, res) {

    // req.method 是请求所用的HTTP方法
    switch (req.method) {
        case 'POST':

            // 为进来的事项设置字符串缓存
            var item = '';

            // 将进来的data事件编码为UTF-8字符串
            req.setEncoding('utf8');
            req.on('data', function (chunk) {

                // 将数据块拼接到缓存上
                item += chunk;
            });

            req.on('end', function () {

                // 将完整的新事项压入事项数组中
                items.push(item);
                res.end('OK\n');
            });
            break;

        case 'GET':
            items.forEach(function (item, i) {
                res.write(i + ') ' + item + '\n');
            });
            res.end();
            break;


    }
});