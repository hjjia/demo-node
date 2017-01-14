/**
 * Created by huangjiajia on 2017/1/11.
 * Description: 用回调处理一次性事件
 */
var http = require('http');
var fs   = require('fs');

http.createServer(function (req, res) {
   if(req.url == '/') {
       fs.readFile('./title.json', function (err, data) {
           if(err) {
               console.error(err);
               res.end('Server Error');
           }
           else {
               var title = JSON.parse(data.toString());

               fs.readFile('./template.html', function (err, data) {
                   if(err) {
                       console.error(err);
                       res.end('Server Error1');
                   }
                   else {
                       var thtml = data.toString();

                       var html = thtml.replace('%', title.join('<li></li>'));

                       res.writeHead(200, {'Content-Type': 'text/html'});
                       res.end(html);
                   }
               });
           }
       });
   }
}).listen(8000, '127.0.0.1',function () {
    console.log('Server is listening on the port 8000');
});
