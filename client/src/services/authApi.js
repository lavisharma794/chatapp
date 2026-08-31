export const loginUser = async (email, password) => {
    try {
       // const endpoint = "http://localhost:8080/api/login";
       const endpoint="https://chatapp-2-ky12.onrender.com/api/login"
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        };
        const response = await fetch(endpoint, payload);
        const data = await response.json();
        if (response.ok) {
            // alert("Login successful!");
            console.log("User:", data.token);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user",JSON.stringify(data.user));
        } else {
            alert(data.message);
        }
        return data;
    }
    catch (e) {
        console.log(e)
    }
}

export const registerUser = async (name, email, password) => {
    try {
        //const endpoint = "http://localhost:8080/api/signupUser";
        const endpoint="https://chatapp-2-ky12.onrender.com/api/signupUser"
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        };
        const response = await fetch(endpoint, payload);
        const data = await response.json();
        if (response.ok) {
            alert("Register successful!");
            console.log("User:", data.name);
        } else {
            alert(data.message);
        }
        return data;

    }
    catch (e) {

    }
}