const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;
let roomName;

function backendDone(msg) {
    console.log('The Backend Says :' +msg);
}
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = this.querySelector("input");
    const value = input.value;
    socket.emit("new_message",roomName, input.value, () =>
    {
        addMessage("You : "+ value);
    });
    input.value = "";
}
function handleNickNameSubmit(event) {
    event.preventDefault();
    const input = this.querySelector("input");
    console.log(input);
    const value = input.value;
    console.log(value);
    socket.emit("change_nickName", room, value, () => {
        addMessage("닉네임이 "+ value + " 으로 변경됨");
    });
}
function showRoom() {
    form.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const roomForm = room.querySelector("#message");
    const nickForm = room.querySelector("#nickName");

    roomForm.addEventListener("submit", handleMessageSubmit); 
    nickForm.addEventListener("submit", handleNickNameSubmit);
}

function handleRoomSubmit(e) 
{
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value="";
}
function addMessage(msg) {
    const ul = room.querySelector("#chat");
    const li = document.createElement("div");
    console.log(msg);
    li.innerText = msg;
    ul.appendChild(li);
}
function countRoomSize(user, count) {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${user} (${count})`;
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, roomSize) => {
    countRoomSize(user, roomSize);
    addMessage(user+" 님께서 참가했습니다");
});

socket.on("bye", (user, roomSize) => {
    countRoomSize(user, roomSize);
    addMessage(user+" 님께서 나갔습니다");
});
socket.on("new_message", (message,) => {
    addMessage(message);
});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length=== 0) {   
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
