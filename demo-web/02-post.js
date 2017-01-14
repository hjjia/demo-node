/**
 * Created by huangjiajia on 2017/1/12.
 * Description: RESTful Web 服务
 * HTTP谓词，GET、POST、PUT、DELETE,分别跟由URL指定的资源的获取、创建、更新和移除相对应。
 *
 * POST 向待办事项清单中添加事项
 * GET 显示当前事项列表，或者显示某一项的详情
 * DELETE 从待办事项清单中移除事项
 * PUT 修改已有事项
 */

// 创建POST请求创建资源
var http = require('http');
var server = http.createServer(function (req, res) {

    req.setEncoding('utf-8');

    // 只要读入了新的数据块，就触发data事件
    req.on('data', function (chunk) {

        // 数据块默认是个Buffer对象（字节数组），可以使用req.setEncoding()指定编码
        console.log('parsed', chunk);
    });

    req.on('end', function () {
        console.log('done parsing');
        res.end();
    });
});
