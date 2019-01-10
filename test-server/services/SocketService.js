var redisClient = require('../modules/redisClient');
const TIME_IN_SECONDS = 3600;

module.exports = function(io) {

    var groups = [];

    var socketidToSessionid = [];

    var sessionPath = "/temp_sessions/";

    io.on('connection', socket => {

        let sessionId = socket.handshake.query['sessionId'];

        socketidToSessionid[socket.id] = sessionId;

        if(sessionId in groups){
            groups[sessionId]['participants'].push(socket.id);
        } else {
            redisClient.get(sessionPath+'/'+sessionId, function(data) {
               if(data) {
                   console.log("session " + sessionId + " terminated previous, found in redis: ");
                   groups[sessionId] = {
                       'cachedChangeEvents': JSON.parse(data),
                       'participants': []
                   }
               } else {
                   console.log("creating new session");
                   groups[sessionId] = {
                       'cachedChangeEvents': [],
                       'participants': []
                   }
               }
               groups[sessionId]['participants'].push(socket.id);
            });
        }

        socket.on("restoreBuffer", () => {
            let sessionId = socketidToSessionid[socket.id];
            console.log('restoring buffer for session' + sessionId+' socket '+socket.id);
            if (sessionId in groups) {
                let changeEvents = groups[sessionId]['cachedChangeEvents'];
                for (let i = 0; i < changeEvents.length ; i++ ){
                    socket.emit(changeEvents[i][0], changeEvents[i][1]);
                }
            }
        });

        socket.on('disconnect', function() {
            let sessionId = socketidToSessionid[socket.id];
            console.log('socket '+socket.id+' disconnect' );

            if(sessionId in groups){
                let participants = groups[sessionId]['participants'];
                let index = participants.indexOf(socket.id);
                if (index >= 0) {
                    participants.splice(index, 1);
                    if(participants.length == 0 ){
                        console.log('last group member leave')
                        let key = sessionPath+"/"+sessionId;
                        let value = JSON.stringify(groups[sessionId]['cachedChangeEvents']);
                        redisClient.set(key,value,redisClient.redisPrint);
                        redisClient.expire(key,TIME_IN_SECONDS);
                        delete groups[sessionId];
                    }
                }
            }
        })

        socket.on('change', (delta) => {
            console.log("The change event "+ socketidToSessionid[socket.id] + " " + delta) ;
            let sessionId = socketidToSessionid[socket.id];

            if(sessionId in groups) {
                groups[sessionId]['cachedChangeEvents'].push(["change",delta, Date.now()]);
            }
            forwardEvents(socket.id, 'change', delta);
        });

        socket.on('cursorMove', (cursor) => {
            console.log("cursorMove + "+ socketidToSessionid[socket.id] + " " + cursor) ;
            let sessionId = socketidToSessionid[socket.id];
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id;
            forwardEvents(socket.id, 'cursorMove', JSON.stringify(cursor));
        });

        function  forwardEvents(socketId, eventName, dataString) {
            let sessionId = socketidToSessionid[socketId];

            if (sessionId in groups ){
                let members =  groups[sessionId]['participants'];
                for (let i=0; i<members.length; i++) {
                    if(socket.id != members[i]) {
                        io.to(members[i]).emit(eventName, dataString);
                    }
                }
            } else {
                console.log("WARNING: could not tie socket_id to any groups!!!");
            }

        }



    })
}