import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleRegister(e) {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/register",
                {
                    username,
                    email,
                    password
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/admin/dashboard");

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Registration failed"
            );
        }
    }

    return (
        <form onSubmit={handleRegister}>

            <h1>Create Account</h1>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">
                Register
            </button>

        </form>
    );
}