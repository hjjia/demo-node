/**
 * Created by huangjiajia on 2017/1/14.
 * Description: 包含程序相关功能的模块
 *
 * 辅助函数：发送HTML、创建表单、接收表单数据
 */
var qs = require('querystring');

/**
 * Description: 发送HTML响应
 * @param res
 * @param html
 */
exports.sendHtml = function (res, html) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(html);
};

/**
 * Description: 解析HTTP POST数据
 * @param req
 * @param cb
 */
exports.parseRecivedData = function (req, cb) {
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function () {
        var data = qs.parse(body);
        cb(data);
    });
};

/**
 * Description: 渲染简单的表单
 * @param id
 * @param path
 * @param label
 */
exports.actionForm = function (id, path, label) {
    var html = '<form method="post" action="' + path + '">' +
        '<input type="hidden" name="id" value="' + id + '" />' +
        '<input type="submit" value="' + label + '" /></form>';

    return html;
};

/**
 * Description: 向数据库中添加数据
 * @param db
 * @param req
 * @param res
 */
exports.add = function (db, req, res) {

    // 解析HTTP POST 数据
    exports.parseRecivedData(req, function (work) {

        // 代码中的问号（?），这是用来指明应该把参数放在哪里的占位符。
        // 在添加到查询语句中之前， query 方法会自动把参数转义，
        // 以防遭受到SQL注入攻击
        db.query(
            'INSERT INTO work (hours, date, description) '+
                ' VALUES (?, ?, ?)',
            [work.hours, work.date, work.description],
            function (err) {
                if(err) {
                    throw err;
                }
                exports.show(db, res);
            }
        )
    });
};

/**
 * Description: 删除记录
 * @param db
 * @param req
 * @param res
 */
exports.delete = function (db, req, res) {

    // 解析HTTP POST数据
    exports.parseRecivedData(req, function (work) {
        db.query(
            'DELETE FROM work WHERE id=?',
            [work.id],
            function (err) {
                if(err) {
                    throw err;
                }

                exports.show(db, res);
            }
        )
    });
};

/**
 * Description: 归档一条记录
 * @param db
 * @param req
 * @param res
 */
exports.archive = function (db, req, res) {

    // 解析HTTP POST请求
    exports.parseRecivedData(req, function (work) {
        db.query('UPDATE work SET archived=1 where id=?',
            [work.id],
            function (err) {
                if(err) {
                    throw err;
                }

                exports.show(db, res);
            })
    });
};

/**
 * Description: 获取工作记录，显示给用户
 * @param db
 * @param res
 */
exports.show = function (db, res, showArchived) {

    var query = 'SELECT * FROM work ' +
            'WHERE archived=? ' +
            'ORDER BY date DESC';

    var archiveValue = (showArchived) ? 1 : 0;

    db.query(
        query,
        [archiveValue],
        function (err, rows) {
            if (err) {
                throw err;
            }

            var html = (showArchived) ? ''
                : '<a href="/archived">Archived Work</a><br/>';

            // 将结果格式化为HTML表格
            html += exports.workHitlistHtml(rows);
            html += exports.workFormHtml();
            exports.sendHtml(res, html);
        }
    );
};

exports.showArchived = function (db, res) {

    // 只显示归档的工作记录
    exports.show(db, res, true);
};

exports.workHitlistHtml = function (rows) {
    var html = '<table>';

    // 将每条工作记录渲染为HTML表格中的一行
    for(var i in rows) {
        html += '<tr>';
        html += '<td>' + rows[i].date + '</td>';
        html += '<td>' + rows[i].hours + '</td>';
        html += '<td>' + rows[i].description + '</td>';

        if(!rows[i].archived) {
            html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
        }

        html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
        html += '</tr>';
    }

    html += '</table>';

    return html;
};

exports.workFormHtml = function () {

    // 渲染用来输入新工作记录的空白HTML表单
    var html = '<form method="post" action="/">' +
        '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text" /></p>' +
        '<p>Hours worked:<br /> <input name="hours" type="text"/></p>' +
        '<p>Description:<br/>' +
        '<textarea name="description"></textarea></p>' +
        '<input type="submit" value="Add"/>' +
        '</form>';

    return html;
};

/**
 * Description: 渲染归档按钮表单
 * @param id
 */
exports.workArchiveForm = function (id) {
    return exports.actionForm(id, '/archive', 'Archive');
};

/**
 * Description: 渲染删除按钮表单
 * @param id
 */
exports.workDeleteForm = function (id) {
    return exports.actionForm(id, '/delete', 'Delete');
};

