/**
 * Created by huangjiajia on 2017/1/16.
 */
var setting    = require('../setting'),
    Db         = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server     = require('mongodb').Server;

module.exports = new Db(setting.db,
    new Server(setting.host, setting.port),{safe: true});