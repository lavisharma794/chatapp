import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authApi";
import "./Signup.css";

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const handleSingup = async (e) => {
        e.preventDefault();
        console.log({ username, email, password });

        const data = registerUser(username, email, password);
        console.log(data);

    };

    const movetoLogin = () => {
        navigate('/')
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">👤</div>
                    <h1>Welcome Back</h1>
                    <p>Register to your account</p>
                </div>

                <form onSubmit={handleSingup}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email id</label>
                        <input
                            type="text"
                            placeholder="Enter your email id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Sign up
                    </button>

                    <p className="signup-text">
                        Yes i have an account? <a className="buttonHref" onClick={movetoLogin}>Login</a>
                    </p>
                </form>

            </div>
        </div>
    );
}

export default Signup;
