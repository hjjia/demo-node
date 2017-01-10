/**
 * Created by huangjiajia on 2017/1/10.
 * Description: 聊天服务器
 */

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames   = [];
var namesUsed   = [];
var currentRoom = {};

/**
 * 启动Socket.io 服务器
 * @param server：需要被监听的服务器
 */
exports.listen = function (server) {

    // 启动Socket.io服务器，允许它搭建在已有的HTTP服务器上
    io = socketio.listen(server);
    io.set('log level', 1);

    // 定义每个用户链接的处理逻辑
    io.sockets.on('connection', function (socket) {

        // 在用户连接上来时赋予其一个访客名
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

        // 在用户连接上来时把他放入聊天室 Lobby里
        joinRoom(socket, 'Lobby');

        // 处理用户的消息、更名以及聊天室的创建和变更
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        // 用户发出请求时，向其提供已经被占用的聊天室的列表
        socket.on('rooms', function () {
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        // 定义用户断开连接后的清除逻辑
        handleClientDisconnection(socket, nickNames, namesUsed);
    })
};

/**
 * Description: 分配用户昵称
 * @param socket
 * @param guestNumber
 * @param nickNames
 * @param namesUsed
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {

    // 生成新昵称
    var name = 'Guest' + guestNumber;

    // 把用户昵称跟客户连接ID关联上
    nickNames[socket.id] = name;

    // 让用户知道他们的昵称
    socket.emit('nameResult', {
        success: true,
        name: name
    });

    // 存放已经被占用的昵称
    namesUsed.push(name);

    // 增加用来生成昵称的计数器
    return guestNumber + 1;
}

/**
 * Description: 进入聊天室里的相关的逻辑
 * @param socket
 * @param room
 */
function joinRoom(socket, room) {

    // 让用户进入房间
    socket.join(room);

    // 记录用户当前房间
    currentRoom[socket.id] = room;

    // 让用户知道他们进入了新的房间
    socket.emit('joinRoom', {room: room});

    // 让房间里的其他用户知道有新用户进入了房间
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });

    // 确定有哪些用户在这个房间里
    var usersInRoom = io.sockets.clients(room);

    // 如果不止一个用户在这个房间里，汇总下都是哪些
    if(usersInRoom.length > 1) {
        var usersInRoomSummary = 'Users currently in '+ room + " : ";
        for(var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id) {
                if(index > 0) {
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }

        usersInRoomSummary += '.';

        // 将房间里其他用户的汇总发送给这个用户
        socket.emit('message', {text: usersInRoomSummary});
    }
}

/**
 * Description: 更名请求的处理逻辑
 * @param socket
 * @param nickNames
 * @param namesUsed
 */
function handleNameChangeAttempts(socket, nickNames, namesUsed) {

    // 添加nameAttempt事件监听器
    socket.on('nameAttempt', function (name) {

        // 昵称不能以Guest开头
        if(name.indexOf('Guest') == 0) {
            socket.emit('nameResult', {
                success: false,
                messages: 'Names cannot begin with "Guest".'
            })
        }
        else {

            // 如果昵称还没有被占用
            if(namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;

                // 删掉之前用户的昵称，让其他用户可以使用
                delete namesUsed[previousNameIndex];

                socket.emit('nameResult', {
                    success: true,
                    name: name
                });

                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + ' is now known as ' + name + '.'
                });
            }
            else {

                // 如果昵称已经被占用，发送错误信息给客户端
                socket.emit('nameResult', {
                    success: false,
                    message: 'That name is already in use.'
                })
            }
        }
    });
}

/**
 * Description: 发送聊天消息
 * @param socket
 */
function handleMessageBroadcasting(socket) {
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        })
    })
}

/**
 * Description: 创建新的房间
 * @param socket
 */
function handleRoomJoining(socket) {
    socket.on('join', function (room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    })
}

/**
 * Description: 断开连接
 * @param socket
 */
function handleClientDisconnection(socket) {
    socket.on('disconnection', function () {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);

        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    })
}