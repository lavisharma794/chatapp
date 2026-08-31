export const createPrivateChat = async (
    userId,
    otherUserId
) => {

    try {

        //const endpoint ="http://localhost:8080/api/chats/private";

 const endpoint="https://chatapp-2-ky12.onrender.com/api/chats/private"

        console.log("Endpoint:", endpoint);

        console.log("Payload:", {
            userId,
            otherUserId
        });


        const response = await fetch(
            endpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: userId,
                    otherUserId: otherUserId
                })
            }
        );


        console.log(
            "Response status:",
            response.status
        );

        console.log(
            "Response URL:",
            response.url
        );


        // ------------------------------------
        // First get text
        // ------------------------------------

        const responseText =
            await response.text();


        console.log(
            "Raw response:",
            responseText
        );


        // ------------------------------------
        // Try JSON
        // ------------------------------------

        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            console.error(
                "Server did not return JSON:",
                responseText
            );

            return null;
        }


        if (!response.ok) {

            console.error(
                "Create chat error:",
                data
            );

            return null;
        }


        console.log(
            "Created/Existing Chat:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "Create private chat error:",
            error
        );

        return null;
    }
};

// ===============================
// GET USER CHATS
// ===============================

export const getUserChats = async (
  userId) => {

  try {

   // const endpoint = `http://localhost:8080/api/chats/user/${userId}`;
     const endpoint = `https://chatapp-2-ky12.onrender.com/api/chats/user/${userId}`;
    

    const response =
      await fetch(endpoint);

    const data =
      await response.json();

    if (!response.ok) {

      console.log(
        "Get chats error:",
        data.message
      );

      return [];
    }

    return data;

  } catch (e) {

    console.log(
      "Get user chats error:",
      e
    );

    return [];
  }
};


// ===============================
// GET CHAT MESSAGES
// ===============================

export const getChatMessages = async (
  chatId) => {

  try {

    //const endpoint =`http://localhost:8080/api/chats/${chatId}/messages`;
    const endpoint=`https://chatapp-2-ky12.onrender.com/api/chats/${chatId}/messages`

    const response =
      await fetch(endpoint);

    const data =
      await response.json();

    if (!response.ok) {

      console.log(
        "Get messages error:",
        data.message
      );

      return [];
    }

    return data;

  } catch (e) {

    console.log(
      "Get chat messages error:",
      e
    );

    return [];
  }
};