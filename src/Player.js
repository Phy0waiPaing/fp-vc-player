import React, { useState } from "react";

const Player = () => {
  const [localShow] = useState(window.location.search != "");
  const Flashphoner = window.Flashphoner;
  const SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
  var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
  var ROOM_EVENT = Flashphoner.roomApi.events;
  var url = "wss://192.168.0.4:8443";
  const id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
  Flashphoner.init({});
  let connection = null;
  const connect = () => {
    connection = Flashphoner.roomApi
      .connect({
        urlServer: url,
        username: document.getElementById("login").value,
      })
      .on(SESSION_STATUS.ESTABLISHED, function (session) {
        joinRoom();
      });
  };
  const joinRoom = () => {
    connection
      .join({ name: getRoomName() })
      .on(ROOM_EVENT.STATE, function (room) {
        console.log("room event state");
        var participants = room.getParticipants();
        setInviteAddress(room.name());
        console.log(`participants length=>${participants.length}`);
        if (participants.length > 0) {
          for (var i = 0; i < participants.length; i++) {
            playParticipantsStream(participants[i]);
          }
        }
        participants.length > 0 && publishLocalMedia(room);
      })
      .on(ROOM_EVENT.JOINED, function (participant) {
        console.log("room event joined");
        playParticipantsStream(participant);
        console.log(participant.name(), "joined");
      })
      .on(ROOM_EVENT.PUBLISHED, function (participant) {
        console.log("room event publish");
        playParticipantsStream(participant);
      });
  };

  const playParticipantsStream = (participant) => {
    const participantStreams = participant.getStreams();
    console.log("participant streams =>", participantStreams);
    if (participantStreams.length > 0) {
      for (var i = 0; i < participantStreams.length; i++) {
        participantStreams[i]
          .play(document.getElementById(`participant${i + 1}Display`))
          .on(STREAM_STATUS.PLAYING, function (playingStream) {});
      }
    }
  };

  const getParamUrl = (name, url) => {
    url = url.match(new RegExp(name + "=([^&=]+)"));
    return url ? url[1] : false;
  };

  const getRoomName = () => {
    var name = window.location.search;
    if (name != "") {
      return getParamUrl("roomName", name);
    }
    return "room-" + id;
  };

  const setInviteAddress = (name) => {
    var inviteURL = window.location.href;
    document.getElementById("inviteAddress").textContent =
      inviteURL.split("?")[0] + "?roomName=" + name;
    console.log("Room name = " + name);
  };

  //publish local video
  const publishLocalMedia = (room) => {
    var constraints = {
      audio: false,
      video: true,
    };
    var display = document.getElementById("local");
    room
      .publish({
        display: display,
        constraints: constraints,
      })
      .on(STREAM_STATUS.PUBLISHING, function (stream) {});
  };
  return (
    <div>
      {localShow && (
        <>
          <div
            id="local"
            style={{ width: 320, height: 240, border: 20, borderColor: "#000" }}
          ></div>
          <br />
        </>
      )}
      <div
        id="participant1Display"
        style={{ width: 320, height: 240, border: 20, borderColor: "#000" }}
      ></div>
      <br />
      {!localShow && (
        <>
          <div
            id="participant2Display"
            style={{ width: 320, height: 240, border: 20, borderColor: "#000" }}
          ></div>
          <br />
        </>
      )}
      <label>Login</label>
      <input
        type="text"
        style={{ borderColor: "#000", border: 20 }}
        id="login"
      />
      <br />
      <br />
      <button id="joinBtn" onClick={connect}>
        Join
      </button>
      <br />
      <br />
      <div id="inviteAddress" style={{ borderColor: "#000", border: 1 }}>
        Not connected
      </div>
    </div>
  );
};
export default Player;
