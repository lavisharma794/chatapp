export const getAlluser = async () => {
   // const endPoint = "http://localhost:8080/api/users";
    const endPoint=`https://chatapp-2-ky12.onrender.com/api/users`;
    const token = localStorage.getItem("token");
    const payload = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };

    //  body: JSON.stringify({
    //         token: token
    //     })

    const response = await fetch(endPoint, payload);
    const data = await response.json();   
    //console.log(data);
    return data;
}