import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

type Sport = {
    name: string;
};

type Event = {
    id: string;
    title: string;
    description: string;
    location_name: string;
    event_date: string;
    start_time: string;
    end_time: string;
    max_players: number;

    sports?: Sport | Sport[] | null;
};

type Profile = {
    id: string;
    username: string;
    available: boolean;
};

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // USER
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUserId(data.session?.user.id ?? null);
        };

        loadUser();
    }, []);

    // EVENTS
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("events")
                .select(`
                    id,
                    title,
                    description,
                    location_name,
                    event_date,
                    start_time,
                    end_time,
                    max_players,
                    sports (name)
                `)
                .order("event_date", { ascending: true });

            if (!error) setEvents((data as Event[]) || []);
            else setEvents([]);

            setLoading(false);
        };

        fetchEvents();
    }, []);

    // PROFILES (availability list)
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("id, username, available");

            setProfiles(data || []);
        };

        // initial load
        fetchProfiles();

        // listen for Taskbar updates
        const handler = () => {
            fetchProfiles();
        };

        window.addEventListener("profiles-update", handler);

        return () => {
            window.removeEventListener("profiles-update", handler);
        };
    }, []);

    // JOINED EVENTS
    useEffect(() => {
        const fetchJoined = async () => {
            if (!userId) return;

            const { data } = await supabase
                .from("event_participants")
                .select("event_id")
                .eq("user_id", userId);

            setJoinedEvents(data?.map((d: any) => d.event_id) || []);
        };

        fetchJoined();
    }, [userId]);

    const getSportName = (event: Event) => {
        const s: any = event.sports;

        if (!s) return "Unknown Sport";
        if (Array.isArray(s)) return s[0]?.name || "Unknown Sport";
        return s.name || "Unknown Sport";
    };

    const joinEvent = async (eventId: string) => {
        if (!userId) {
            navigate("/login");
            return;
        }

        if (joinedEvents.includes(eventId)) return;

        const { error } = await supabase
            .from("event_participants")
            .insert({
                event_id: eventId,
                user_id: userId,
                joined_at: new Date().toISOString(),
            });

        if (!error) {
            setJoinedEvents((prev) => [...prev, eventId]);
        }
    };

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">

                <div>
                    <h1 className="dashboard-title">
                        Sports Hub
                    </h1>
                    <p className="dashboard-subtitle">
                        Join events and find players
                    </p>
                </div>

                <div className="top-actions">

                    <button onClick={() => navigate("/chat")} className="nav-button">
                        💬 Chat
                    </button>

                    <button onClick={() => navigate("/event")} className="nav-button primary">
                        ➕ Create Event
                    </button>

                    <button onClick={() => navigate("/pevents")} className="nav-button">
                        🏆 My Events
                    </button>

                    <button onClick={() => navigate("/profile")} className="nav-button">
                        👤 Profile
                    </button>

                </div>
            </div>
            {/* AVAILABLE PEOPLE */}
            <div className="availability-section">

                <h2 className="section-title">
                    Available People
                </h2>

                <div className="availability-list">

                    {profiles.map((p) => (
                        <div key={p.id} className="availability-item">

                            <span
                                className={`status-dot ${
                                    p.available ? "online" : "offline"
                                }`}
                            />

                            <span>{p.username}</span>

                        </div>
                    ))}

                </div>
            </div>
            <h2 className="section-title">
                Events
            </h2>
            {/* EVENTS */}
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : (
                <div className="events-grid">

                    {events.map((event) => {
                        const isJoined = joinedEvents.includes(event.id);

                        return (
                            <div key={event.id} className="event-card">

                                <div className="event-sport">
                                    {getSportName(event)}
                                </div>

                                <h2 className="event-title">
                                    {event.title}
                                </h2>

                                <p className="event-desc">
                                    {event.description}
                                </p>

                                <div className="event-meta">
                                    📍 {event.location_name}
                                </div>

                                <div className="event-meta">
                                    📅{" "}
                                    {new Date(event.event_date).toLocaleDateString()}
                                </div>

                                <div className="event-meta">
                                    🕒 {event.start_time} → {event.end_time}
                                </div>

                                <div className="event-meta">
                                    👥 Max {event.max_players}
                                </div>

                                {isJoined ? (
                                    <button className="joined-button" disabled>
                                        ✅ Joined
                                    </button>
                                ) : (
                                    <button
                                        className="join-button"
                                        onClick={() => joinEvent(event.id)}
                                    >
                                        Join Event
                                    </button>
                                )}
                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}