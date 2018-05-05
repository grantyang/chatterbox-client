// YOUR CODE HERE:
// Server: http://parse.sfm6.hackreactor.com/
// escape notes: &, <, >, ", ', `, , !, @, $, %, (, ), =, +, {, }, [, and ] 
// http://parse.sfm6.hackreactor.com/chatterbox/classes/messages
//
// $.ajax({
//   // This is the url you should use to communicate with the parse API server.
//   url: 'http://parse.CAMPUS.hackreactor.com/chatterbox/classes/messages',
//   type: 'POST',
//   data: JSON.stringify(message),
//   contentType: 'application/json',
//   success: function (data) {
//     console.log('chatterbox: Message sent');
//   },
//   error: function (data) {
//     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//     console.error('chatterbox: Failed to send message', data);
//   }
// });

//
const app = {
    init: function () {
        // Get the modal
        this.modal = $('#myModal');

        // Get the button that opens the modal
        this.btn = $('#myBtn');

        // Get the <span> element that closes the modal
        this.span = $('.close')[0];

        // When the user clicks on the button, open the modal 
        this.btn.on('click', () => {
            console.log(this)
            this.modal.toggle();
        })

        // When the user clicks on <span> (x), close the modal
        this.span.onclick = () => {
            this.modal.toggle();
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = (event) => {
            if (event.target == this.modal) {
                this.modal.toggle();
            }
        }

        let createRoomBtn = $('#createRoomBtn');
        createRoomBtn.on('click', () => {
            let newName = $('#newRoomName').val()
            app.renderRoom(newName);
            this.modal.toggle();
        })

        this.storedMessages = [];
        this.storedRooms = {};
        this.chatsBlock = $('#chats');
        this.dropdown = $('#roomSelect');
        app.fetch('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages');
        console.log(this.storedMessages)
    },
    fetch: function (url) {
        $.ajax({
            // This is the url you should use to communicate with the parse API server.
            url: url,
            type: 'GET',
            data: { 'order': '-createdAt' },
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
                console.error('chatterbox: Failed to send message', data);
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
        let { roomname, text, username, createdAt, objectId } = message;
        console.log('roomname ', roomname)
        console.log('text ', text)
        console.log('username ', username)
        console.log('createdAt ', createdAt)
        console.log('objectId ', objectId)
        if (!app.storedRooms[roomname]) {
            let roomnameOption = `<option class="${roomname}" value="${roomname}">${roomname}</option>`
            app.dropdown.append(roomnameOption);
            app.storedRooms[roomname] = true;
        }

        let messageDiv = `<div class="${roomname}">${text}</div>`
        $(`#chats`).append(messageDiv);

        // $('#chats').append(sanitizedMessageDiv);

        // if (storedRooms.includes(message.roomname)) {
        //     //if room exists, add message to room
        //     $(`.${roomname}`)
        // }
        // //create room, add messsage to room
    },
    sanitizeInput: function (input) {
        let scriptPattern = /<script>|<\/script>|$\(|<\/|function\(|=>/gi;
        let sanitizedObj = {};
        for (let key in input) {
            if (input[key] !== undefined) {
                sanitizedObj[key] = input[key].replace(scriptPattern, '');
            } else {
                sanitizedObj[key] = undefined;
            }
        }
        return sanitizedObj;
    },
    renderRoom: function (input) {
        let scriptPattern = /<script>|<\/script>|$\(|<\/|function\(|=>/gi;
        let sanitizedName = input.replace(scriptPattern, '');
        let roomnameOption = `<option class="${sanitizedName}" value="${sanitizedName}">${sanitizedName}</option>`
        app.dropdown.append(roomnameOption);
        app.storedRooms[sanitizedName] = true;
    }
}
app.init()

// $.ajax({
//     // This is the url you should use to communicate with the parse API server.
//     url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
//     type: 'GET',
//     contentType: 'application/json',
//     data: { 'order': '-createdAt' },
//     success: function (data) {
//         let scriptPattern = /<script>|<\/script>|$\(|<\/|function\(|=>/gi;
//         let chatsBlock = $('#chats');
//         let roomDropdown = $('#roomDropdown');

//         data.results.forEach(message => {
//             console.log(this)
//             sanitizedObj = sanitizeInput(message);
            // let sanitizedRoomname = sanitizedObj.roomname;
            // let sanitizedText = sanitizedObj.text;
//             for (let key in sanitizedObj) {
//                 if (key === 'roomname' && $(`.${sanitizedRoomname}`).length === 0) {
//                     let sanitizedRoomnameDiv = `<div class="room ${sanitizedRoomname} hidden"></div>`
//                     let sanitizedRoomnameOption = `<option value="${sanitizedRoomname}">${sanitizedRoomname}</option>`
//                     //<option value="volvo">Volvo</option>
//                     chatsBlock.append(sanitizedRoomnameDiv);
//                     roomDropdown.append(sanitizedRoomnameOption);
//                 }
//                 if (key === 'text') {
//                     let sanitizedMessageDiv = `<div>${sanitizedText}</div>`
//                     if ($(`.${sanitizedRoomname}`).length !== 0) {
//                         $(`.${sanitizedRoomname}`).append(sanitizedMessageDiv);
//                     }
//                 }
//                 storedMessages.push(message);
//             }
//         });
//         console.log('chatterbox: GET request success', data);
//     },
//     error: function (data) {
//         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//         console.error('chatterbox: GET request failed', data);
//     }
// });
