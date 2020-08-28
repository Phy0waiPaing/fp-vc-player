var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
var ROOM_EVENT = Flashphoner.roomApi.events;
// var participants = 5
var connection;
var url = "wss://192.168.0.4:8443";
const id = `f${(~~(Math.random()*1e8)).toString(16)}`;
 
function init_page() {
    Flashphoner.init({});
    joinBtn.onclick = connect;
}
  
function connect() {  
    connection = Flashphoner.roomApi.connect({
        urlServer: url,
        username: document.getElementById("login").value
    }).on(SESSION_STATUS.ESTABLISHED, function(session) {
        joinRoom();
    });
}
  
function joinRoom() {
    connection.join({ name: getRoomName()})
    .on(ROOM_EVENT.STATE, function(room) {
        var participants = room.getParticipants();
        setInviteAddress(room.name());
        if (participants.length > 0) {
            for (var i = 0; i < participants.length; i++) {
                playParticipantsStream(participants[i]);
            }
        }
        publishLocalMedia(room);
    }).on(ROOM_EVENT.JOINED, function(participant) {
        playParticipantsStream(participant);
        console.log(participant.name(), "joined");
    }).on(ROOM_EVENT.PUBLISHED, function(participant) {
       playParticipantsStream(participant);
    });
}
  
function playParticipantsStream(participant) {
    if (participant.getStreams().length > 0) {
        participant.getStreams()[0].play(document.getElementById("participantDisplay"))
        .on(STREAM_STATUS.PLAYING, function(playingStream) {});
    }
}
  
function getParamUrl(name, url) {
    url = url.match(new RegExp(name + '=([^&=]+)'));
    return url ? url[1] : false;
}
 
function getRoomName() {
    var name = window.location.search;
    if (name != "") {
        return getParamUrl("roomName", name);
    }
    return "room-" + id;
}
  
function setInviteAddress(name) {
    var inviteURL = window.location.href;
    document.getElementById("inviteAddress").textContent = (inviteURL.split("?")[0] + "?roomName=" + name);
    console.log("Room name = "+ name);
}
  
//publish local video
function publishLocalMedia(room) {
    var constraints = {
        audio: true,
        video: true
    };
    var display = document.getElementById("local");
    room.publish({
        display: display,
        constraints: constraints,
    }).on(STREAM_STATUS.PUBLISHING, function(stream) {});
}