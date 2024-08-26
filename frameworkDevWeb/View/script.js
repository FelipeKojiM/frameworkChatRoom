var stompClient = null;
var username = null;

document.getElementById("welcome-form").style.display = "block";

    function enterChatRoom() {
        username = document.getElementById("username").value.trim();
    
        if(username){
            var welcomeForm = document.getElementById("welcome-form");
            welcomeForm.classList.add('hide');
            setTimeout(() => {
                welcomeForm.style.display = 'none';
                var chatRoom = document.getElementById('chat-room');
                chatRoom.style.display = 'block';
                setTimeout(() => { chatRoom.classList.add('show'); }, 10);
            }, 550);
            connect();
            Swal.fire({
                title: 'Bem-vindo!',
                text: 'Você entrou na sala de bate-papo.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                title: 'Atenção!',
                text: 'Por favor, insira um nickname!',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    }

    function connect() {
        var socket = new SockJS('https://9e7df17fa210.ngrok.app/chat-websocket', {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        stompClient = Stomp.over(socket);
    
        stompClient.connect({}, function (frame) {
            console.log('Conectado: ' + frame);
    
            stompClient.subscribe('/topic/public', function(messageOutput) {
                showMessage(JSON.parse(messageOutput.body));
            });
    
            stompClient.send("/app/addUser", {}, JSON.stringify({
                sender: username,
                type: 'JOIN'
            }));
        }, function (error) {
            console.error('Erro na conexão: ' + error.headers.message);
        });
    }

    function showMessage(message){
        var messageElement = document.createElement('div');

        if(message.type === 'JOIN'){
            messageElement.innerText = message.sender + " entrou na sala ";
        }else if(message.type === 'LEAVE') {
            messageElement.innerText = message.sender + " saiu da sala ";
        }else {
            messageElement.innerText = message.sender + " disse: " + message.content;
        }    
     
     document.getElementById('messages').appendChild(messageElement);
    }

    function sendMessage() {
        var messageContent = document.getElementById("messageInput").value.trim();
    
        if (messageContent && stompClient) {
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você deseja enviar esta mensagem?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, enviar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    var chatMessage = {
                        sender: username,
                        content: messageContent,
                        type: 'CHAT'
                    };
                    stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
                    document.getElementById("messageInput").value = '';
                    Swal.fire({
                        title: 'Mensagem Enviada!',
                        text: 'Sua mensagem foi enviada com sucesso.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                }
            });
        } else {
            Swal.fire({
                title: 'Erro!',
                text: 'Por favor, digite uma mensagem.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    function leaveChat() {
        if (stompClient) {
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você deseja sair da sala de bate-papo?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, sair',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    var chatMessage = {
                        sender: username,
                        type: 'LEAVE'
                    };
                    stompClient.send("/app/leaveUser", {}, JSON.stringify(chatMessage));
                    stompClient.disconnect(() => {
                        console.log("Desconectado");
                        document.getElementById("username").value = '';    

                        Swal.fire({
                            title: 'Adeus!',
                            text: 'Você saiu da sala de bate-papo.',
                            icon: 'info',
                            confirmButtonText: 'OK'
                        });
    
                        var chatRoom = document.getElementById("chat-room");
                        chatRoom.classList.remove('show');
                        setTimeout(() => {
                            chatRoom.style.display = "none";
                            var welcomeForm = document.getElementById('welcome-form');
                            welcomeForm.style.display = 'block';
                            setTimeout(() => { welcomeForm.classList.remove('hide'); }, 10);
                        }, 550);
                    });
                }
            });
        }
    }
    

    function displayImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgElement = document.getElementById('userImage');
                imgElement.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    }
