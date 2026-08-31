import { io } from "socket.io-client";
// export const socket = io("http://localhost:8080/",{
//     autoConnect:false
// });

export const socket = io("https://chatapp-2-ky12.onrender.com",{
    autoConnect:false
});

