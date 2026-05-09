import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Taskbar() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
        };

        loadUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        navigate("/");
    };

    return (
        <header style={styles.header}>
            <h1 style={styles.title}>ShowUp2Move</h1>

            <div style={styles.right}>

                {/* DASHBOARD BUTTON (ONLY IF LOGGED IN) */}
                {user && (
                    <button
                        style={styles.button}
                        onClick={() => navigate("/dashboard")}
                        title="Dashboard"
                    >
                        🏠 Dashboard
                    </button>
                )}

                {/* PROFILE BUTTON */}
                {user && (
                    <button
                        style={styles.iconButton}
                        onClick={() => navigate("/profile")}
                        title="Profile"
                    >
                        👤
                    </button>
                )}

                {/* LOGIN / LOGOUT */}
                {!user ? (
                    <button
                        style={styles.button}
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                ) : (
                    <button
                        style={styles.button}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        height: "64px",
        width: "100%",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: "0 16px",
        boxSizing: "border-box",

        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,

        background: "linear-gradient(135deg, #0aa2ff, #0066ff, #00c3ff)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0, 120, 255, 0.35)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
    },

    title: {
        margin: 0,
        fontSize: "18px",
        fontWeight: 600,
        textShadow: "0 0 10px rgba(255,255,255,0.6)",
    },

    right: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    button: {
        padding: "6px 12px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",

        background: "rgba(255,255,255,0.25)",
        color: "white",

        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",

        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        fontSize: "14px",
    },

    iconButton: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",

        background: "rgba(255,255,255,0.3)",
        color: "white",
        fontSize: "16px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    },
};