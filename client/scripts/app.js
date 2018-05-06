// YOUR CODE HERE:
// Server: http://parse.sfm6.hackreactor.com/
// escape notes: &, <, >, ", ', `, , !, @, $, %, (, ), =, +, {, }, [, and ] 

const app = {
    init: function () {
        // Get the modal
        this.modal = $('#myModal');

        // Get the button that opens the modal
        this.btn = $('#myBtn');

        // When the user clicks on the button, open the modal 
        this.btn.on('click', () => {
            this.modal.toggle();
        })

        // When the user clicks on <span> (x), close the modal
        $('.close').on('click', () => {
            this.modal.toggle();
        });

        $('#createRoomBtn').on('click', () => {
            let newName = $('#newRoomName').val()
            app.renderRoom(newName);
            this.modal.toggle();
        })

        $(document).on('click', '.username', (event) => {
            let friendName = event.target.innerText;
            $(`.username:contains(${friendName})`).closest('.message').toggleClass('friend');
        })

        $('#sendMessageBtn').on('click', (event) => {
            let currentRoom = this.dropdown.val();
            let newMessage = $('#inputValue').val();
            let username = app.getUsername();
            let messageObj = {
                roomname: currentRoom,
                text: newMessage,
                username: username
            }
            app.send(messageObj);
        })

        this.myFriends = {};
        this.storedMessages = [];
        this.storedRooms = { 'lobby': true };
        this.currentRoom;
        this.chatsBlock = $('#chats');
        this.dropdown = $('#roomSelect');
        this.dropdown.change(() => {
            this.currentRoom = this.dropdown.val();
            console.log('current room is ', this.currentRoom)
            if (this.currentRoom === 'lobby') {
                $(`.message`).css('display', 'block');
            } else {
                $(`.${this.currentRoom}`).css('display', 'block');
                $(`.message:not(.${this.currentRoom})`).css('display', 'none');
            }
        })

        app.fetch('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages', { 'order': '-createdAt' });

        setInterval(() => {
                    console.log('most recent message was: ', app.storedMessages[0].text);
            let mostRecentDate = app.storedMessages[0].createdAt
                    console.log('most recent message sent at: ', mostRecentDate);
            $.ajax({
                // This is the url you should use to communicate with the parse API server.
                url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
                type: 'GET',
                data: "where=" + escape(JSON.stringify({ 'createdAt': { '$gt': { '__type': 'Date', 'iso': mostRecentDate } } })),
                contentType: 'application/json',
                success: function (data) {
                    data.results.forEach(message => {
                        sanitizedObj = app.sanitizeInput(message);
                        app.storedMessages = [sanitizedObj, ...app.storedMessages];
                        app.prependRenderMessage(sanitizedObj)
                    });

                    console.log('chatterbox: REFRESH request success', data.results);
                },
                error: function (data) {
                    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
                    console.error('chatterbox: Failed to fetch message', data);
                }
            });
        }, 1000);

    },
    fetch: function (url, data) {
        console.log('data is', data)
        $.ajax({
            // This is the url you should use to communicate with the parse API server.
            url: url,
            type: 'GET',
            data: data,
            contentType: 'application/json',
            success: function (data) {
                data.results.forEach(message => {
                    // console.log('before sanitization: ', message.text)
                    sanitizedObj = app.sanitizeInput(message);
                    // console.log('after sanitization: ', sanitizedObj.text)
                    app.storedMessages.push(sanitizedObj);
                });
                // console.log('chatterbox: GET request success', data);
                console.log('storedMessages is: ');
                console.log(app.storedMessages);
                app.storedMessages.forEach(message => app.renderMessage(message));
            },
            error: function (data) {
                // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
                console.error('chatterbox: Failed to fetch message', data);
            }
        });
    },
    send: function (message) {
        $.ajax({
            // This is the url you should use to communicate with the parse API server.
            url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
            type: 'POST',
            data: JSON.stringify(message),
            contentType: 'application/json',
            success: function (data) {
                console.log('chatterbox: Message sent');
            },
            error: function (data) {
                // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
                console.error('chatterbox: Failed to send message', data);
            }
        });
    },
    clearMessages: function () {
        $('#chats').children().remove();
    },
    renderMessage: function (message) {
        if (message.text && message.text.length > 0) {
            let { roomname, text, username, createdAt, objectId } = message;
            if (roomname + "" === 'undefined' || roomname + "" === 'null' || roomname.trim() === '') {
                roomname = 'lobby';
            }
            let roomnameClass = roomname.split(' ').join('');

            if (!app.storedRooms[roomname]) {
                let roomnameOption = `<option class="${roomnameClass}" value="${roomnameClass}">"${roomname}"</option>`
                app.dropdown.append(roomnameOption);
                app.storedRooms[roomname] = true;
            }

            let messageDiv = `<div class="message ${roomnameClass}"><span class="username">${username || 'no name'}</span><span class="messageText">: ${text}</span></div>`
            $(`#chats`).append(messageDiv);
        }
    }, prependRenderMessage: function (message) {
        if (message.text && message.text.length > 0) {
            let { roomname, text, username, createdAt, objectId } = message;
            if (roomname + "" === 'undefined' || roomname + "" === 'null' || roomname.trim() === '') {
                roomname = 'lobby';
            }
            let roomnameClass = roomname.split(' ').join('');

            if (!app.storedRooms[roomname]) {
                let roomnameOption = `<option class="${roomnameClass}" value="${roomnameClass}">"${roomname}"</option>`
                app.dropdown.append(roomnameOption);
                app.storedRooms[roomname] = true;
            }

            let messageDiv = `<div class="message ${roomnameClass}"><span class="username">${username || 'no name'}</span><span class="messageText">: ${text}</span></div>`
            $(`#chats`).prepend(messageDiv);
        }
    },
    sanitizeInput: function (input) {
        // let scriptPattern = /<script>|<\/script>|$\(|<\/|function\(|=>|<img|#.+{|\..+{|<style>|<\/style>/gi;
        let sanitizedObj = {};
        for (let key in input) {
            if (input[key] !== undefined && input[key] !== null) {
                sanitizedObj[key] = _.escape(input[key])
                // sanitizedObj[key] = input[key].replace(scriptPattern, '');
            } else {
                sanitizedObj[key] = undefined;
            }
        }
        return sanitizedObj;
    },
    renderRoom: function (input) {
        // let scriptPattern = /<script>|<\/script>|$\(|<\/|function\(|=>|<img|#.+{|\..+{|<style>|<\/style>/gi;
        let sanitizedName = _.escape(input)
        // let sanitizedName = input.replace(scriptPattern, '');
        if (!app.storedRooms[sanitizedName]) {
            let roomnameOption = `<option class="${sanitizedName}" value="${sanitizedName}">${sanitizedName}</option>`
            app.dropdown.append(roomnameOption);
            app.storedRooms[sanitizedName] = true;
        } else {
            alert('Room already exists!')
        }
    },
    getUsername: function () {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === 'username') {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }
}
app.init()
