import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/login",
                {
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
                "Login failed"
            );
        }
    }

    return (
        <form onSubmit={handleLogin}>

            <h1>Login</h1>

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
                Login
            </button>

        </form>
    );
}