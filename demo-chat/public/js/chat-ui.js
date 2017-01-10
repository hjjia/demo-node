/**
 * Created by huangjiajia on 2017/1/10.
 * Description：主要处理用户聊天数据
 */

/**
 * Description: 转义html标签
 * @param message
 * @returns {*|jQuery}
 */
function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

/**
 * Description: 显示系统创建的受信内容
 * @param message
 * @returns {*|jQuery}
 */
function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>')
}

/**
 * Description: 处理原始的用户输入
 * @param chatApp：聊天处理程序
 * @param socket
 */
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;

    // 如果用户输入的内容以斜杠（/）开头，将其作为聊天命令
    if(message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);

        if(systemMessage) {
            $('#message').append(divSystemContentElement(systemMessage));
        }
    }
    else {

        // 将非命令输入广播给其他用户
        chatApp.sendMessage($('#room').text(), message);

        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function () {
    var chatApp = new Chat(socket);

    // 显示更换名称的结果
    socket.on('nameResult', function (result) {
        var message;

        if(result.success) {
            message = 'You are now known as ' + result.name + '.';
        }
        else {
            message = result.message;
        }

        $('#messages').append(divSystemContentElement(message));
    });

    // 显示房间更换结果
    socket.on('joinResult', function (result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changes.'));
    });

    // 显示接收到的消息
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    // 显示可用房间列表
    socket.on('rooms', function (rooms) {
        $('#room-list').empty();

        for(var room in rooms) {
            room = room.substring(1, room.length);

            if(room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        // 点击房间名可以换到那个房间
        $('#room-list div').click(function () {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });

    // 定期请求可用房间列表
    setInterval(function () {
        socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();

    // 提交表单可以发送聊天消息
    $('#send-form').submit(function () {
        processUserInput(chatApp, socket);
        return false;
    })
});




