import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setMessage("");

        const email = `${username}@app.local`;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        // 🔥 FORCE TASKBAR REFRESH (IMPORTANT)
        window.dispatchEvent(new Event("availability-change"));

        navigate("/dashboard");
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1 className="login-title">🔐 Login</h1>

                <input
                    className="login-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="login-button"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    Login
                </button>

                <p
                    style={{ cursor: "pointer", color: "#0077ff" }}
                    onClick={() => navigate("/register")}
                >
                    Don't have an account? Register
                </p>

                {message && (
                    <p className="login-message">{message}</p>
                )}

            </div>
        </div>
    );
}