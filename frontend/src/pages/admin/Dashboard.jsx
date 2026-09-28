import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        api.get("/users/me")
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                localStorage.removeItem("access_token");
                window.location.href = "/admin/login";
            });

    }, []);    

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>

            <h1>Dashboard</h1>           
            <p>
                Welcome, {user.username}
            </p>

            <p>
                Email: {user.email}
            </p>

            <p>
                Role: {user.role}
            </p>

        </div>
    );
}