/**
 * Created by huangjiajia on 2017/1/13.
 * Description: 存储数据几种方式
 * 1. 不需要安装和配置DBMS
 * 2. 使用数据库MySQL 或者PostgreSQL
 * 3. 用NoSQL数据库存储数据，Redis、MongoDB和Mongoose
 */

/*
 * 无服务器存储数据,基于内存存储和文件储存
 * 1. 内存存储
 * 2. 文件存储
 */

/*
 * 1. 内存存储
 * 理想用途是存放少量经常使用的数据
 * 服务器和程序重启之后数据就丢失了
 */
var http    = require('http');
var counter = 0;

var server = http.createServer(function (req, res) {
    counter ++;

    res.write('I have been accessed ' + counter + ' times.');
    res.end();
}).listen(8888);

/*
 * 2. 文件存储
 * 用文件存放数据，经常用于保存程序的配置信息
 * 但不适合多用户程序，会出现并发问题，这个时候应该选择数据库
 */


