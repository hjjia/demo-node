/**
 * Created by huangjiajia on 2017/1/10.
 * Description: 创建服务器
 */
var http       = require('http');     // 内置的http模块提供了HTTP服务器和客户调功能
var fs         = require('fs');
var path       = require('path');     // 内置的path模块提供了与文件系统路径相关的功能
var mime       = require('mime');     // 附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache      = {};                  // cache是用来缓存文件内容的对象
var chatServer = require('./lib/chat-server');   // 聊天服务器

/**
 * Description: 所请求得文件不存在时发送404错误
 * @param res
 */
function send404(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error 404: resource not found');
    res.end();
}

/**
 * Description: 提供文件数据服务
 * @param res: 响应对象
 * @param filePath：文件路径，用于获取文件后缀名
 * @param fileContents：文件内容
 */
function sendFile(res, filePath, fileContents) {
    res.writeHead(200, {
        'Content-Type': mime.lookup(path.basename(filePath))
    });
    res.end(fileContents);
}

/**
 * Description: 提供静态文件服务
 * @param res
 * @param cache：内存中的缓存数组
 * @param absPath：文件路径
 */
function serverStatic(res, cache, absPath) {

    console.log('ello');

    if(cache[absPath]) {     // 检查文件是否缓存在内存中
        sendFile(res, absPath, cache[absPath]);  // 从内存中返回文件
    }
    else {

        console.log('not in cache');
        fs.exists(absPath, function (exists) {   // 检查文件是否存在
            console.log('read in fs');
            if(exists) {
                console.log('exists');
                fs.readFile(absPath, function (err, data) {    // 从硬盘中读取文件

                    console.log('readfile');
                    if(err) {
                        console.log('err oooo');
                        send404(res);
                    }
                    else {

                        console.log('exists data');
                        cache[absPath] = data;

                        // 从硬盘中读取文件并返回
                        sendFile(res, absPath, data);
                    }
                });
            }
            else {

                // 发送HTTP 404响应
                send404(res);
            }
        })

    }
}

/**
 * 创建 HTTP 服务器逻辑
 * 在创建HTTP服务器时，需要给 createServer 传入一个匿名函数作为回调函数，由它来处
 * 理每个HTTP请求。这个回调函数接受两个参数： request 和 response 。在这个回调执行时，
 * HTTP服务器会分别组装这两个参数对象，以便你可以对请求的细节进行处理，并返回一个响应。
 */
var server = http.createServer(function (req, res) {
    var filePath = false;

    if(req.url == '/') {
        filePath = 'public/index.html';    // 确定返回默认HTML文件
    }
    else {

        // 将url 路径转为文件的相对路径
        filePath = 'public' + req.url;
    }

    var absPath = './' + filePath;

    // 返回静态文件
    serverStatic(res, cache,absPath);
});

server.listen(3000, function () {
    console.log('Server listening on port 3000');
});

// 给聊天服务器提供server服务器，这样他就能够跟server共享同一个TCP/IP端口
chatServer.listen(server);
