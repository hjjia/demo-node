/**
 * Created by huangjiajia on 2017/1/11.
 * Description: 事件发射器  http socket stream
 */
var net = require('net');

var server = net.createServer(function (socket) {
    socket.on('data', function (data) {
        socket.write(data);
    });

    // 让服务器只回应第一次发过来的数据
    /*socket.once('data', function (data) {
        socket.write(data);
    })*/
});

server.listen(8888);

