/**
 * Created by huangjiajia on 2017/1/11.
 * Description: 用回调处理一次性事件, 创建中间函数减少嵌套
 */
var http = require('http');
var fs   = require('fs');

var server = http.createServer(function (req, res) {
   getTitle(res);
}).listen(8000, '127.0.0.1', function () {
    console.log('Server is listening form the port 8000');
});

function getTitle(res) {
    fs.readFile('./title.json', function (err, data) {
        if(err) {
            return hadError(err, res);
        }
        else {
            getTemplate(JSON.parse(data.toString()), res);
        }
    })
}

function hadError(err, res) {
    console.error(err);
    res.end('Server Error');
}

function getTemplate(title, res) {
    fs.readFile('./template.html', function (err, data) {
        if(err) {
            return hadError(err, res);
        }
        else {
            formatHtml(title, data.toString(), res);
        }
    })
}

function formatHtml(title, data, res) {
    var html = data.replace('%', title.join('<li></li>'));
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
}