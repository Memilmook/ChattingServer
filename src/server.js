import express from "express";
import SocketIO from "socket.io";
import http from "http";
// import WebSocket from "ws";

const app = express();
//set 설정
//use 유저가 볼수 있는 페이지를 설정
//get = 주소를 받아올때 렌더링해줄 곳을 정해주는 역할
app.set("view engine", "pug"); 
app.set("views", __dirname+ "/views");
app.use("/public", express.static(__dirname + "/public")); 
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on ws:')
// app.listen(3000, handleListen);
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
httpServer.listen(3000, handleListen);

function publicRooms() {
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}
function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}
wsServer.on("connection", (socket) => {
    socket["nickname"] = 'anonymous';
    // socket.emit("room_change", publicRooms());
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter);
        console.log('Socket Event : ' + event);
    });
    socket.on("enter_room", (roomName, showRoom) => {
        socket.join(roomName);
        showRoom();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (room, msg, done) =>{
        let message = socket["nickname"]+" : "+msg;
        socket.to(room).emit("new_message", message);
        done();
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("change_nickName", (room, msg, done) => {
        socket["nickname"] = msg;
        done();
    });
});

// const wss = new WebSocket.Server({server});

// wss.on("connection", function socket(socket) {
//     console.log(socket);
// });
// const sockets=[];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//         socket["nickname"] = "anonymouse";
//     socket.on("close",onSocketClose);
//     socket.on("message", (message) => {
//         const message = JSON.parse(message);
//         switch(message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) =>
//                 aSocket.send("message"))
//         }
//         sockets
//     });
//     socket.send("hello!");
// });



function onSocketClose() {
    console.log("disconnet from the browser")
}
function EncodeMessage(message) {
    return Buffer.from(message, "base64").toString("utf-8");
}