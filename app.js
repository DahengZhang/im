// 已经注册的用户列表
const USERS = {
  18014938121: {
    name: '张大亨',
    phone: 18014938121
  },
  18014938120: {
    name: '杭晨',
    phone: 18014938120
  },
  18014938122: {
    name: '尤俊鹏',
    phone: 18014938122
  }
}

let OffLineMSG = {}

// 创建websocket服务
const WebSocketServer = require('ws').Server,
      wss = new WebSocketServer({
        port: 80,
        perMessageDeflate: false
      })

// 有人上线
wss.on('connection', function (ws, req) {
  if (USERS[ws.protocol] === undefined) {
    // 用户不存在
    ws.close()
  }
  if (OffLineMSG[ws.protocol]) {
    OffLineMSG[ws.protocol].forEach(function (msg) {
      msg = JSON.parse(msg)
      sendMessage(msg)
    })
    delete OffLineMSG[ws.protocol]
  }
  ws.on('message', function (message) {
    // 收到消息
    message = JSON.parse(message)
    if (USERS[message.target]) {
      message.user = USERS[ws.protocol]
      sendMessage(message)
    }
  })
  ws.on('close', function () {
    // 用户退出
    if (USERS[ws.protocol] === undefined) {
      return
    }
    console.log(ws.protocol, '用户退出')
  })
})

function sendMessage (message) {
  console.log('当前在线人数: ', [...wss.clients].length)
  let sended = false
  wss.clients.forEach(function each(client) {
    if (client.protocol === message.target) {
      sended = true
      delete message.target
      client.send(JSON.stringify(message))
    }
  })
  if (!sended) {
    if (OffLineMSG[message.target]) {
      OffLineMSG[message.target].push(JSON.stringify(message))
    } else {
      OffLineMSG[message.target] = [JSON.stringify(message)]
    }
  }
}
