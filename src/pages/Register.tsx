import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleRegister = async () => {
        setMessage("");

        // ✅ check passwords match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const email = `${username}@app.local`;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        });

        if (error) {
            setMessage(error.message);
        } else {
            navigate("/login");
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1 className="login-title">Register</h1>

                {/* USERNAME */}
                <input
                    className="login-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                {/* PASSWORD */}
                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* CONFIRM PASSWORD */}
                <input
                    className="login-input"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* BUTTON */}
                <button
                    className="login-button secondary"
                    onClick={handleRegister}
                    disabled={loading}
                >
                    Sign Up
                </button>

                {/* LINK */}
                <p
                    style={{ cursor: "pointer", color: "#0077ff" }}
                    onClick={() => navigate("/login")}
                >
                    Already have an account? Login
                </p>

                {/* MESSAGE */}
                {message && (
                    <p className="login-message">{message}</p>
                )}

            </div>
        </div>
    );
}