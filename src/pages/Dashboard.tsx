import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

type Event = {
    id: string;
    title: string;
    description: string;
    location_name: string;
    start_time: string;
    end_time: string;
    max_players: number;

    sports?: {
        name: string;
    } | {
        name: string;
    }[] | null;
};

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUserId(data.session?.user.id ?? null);
        };

        loadUser();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);

            const { data } = await supabase
                .from("events")
                .select(`
                    id,
                    title,
                    description,
                    location_name,
                    start_time,
                    end_time,
                    max_players,
                    sports (name)
                `)
                .order("start_time", { ascending: true });

            setEvents(data || []);
            setLoading(false);
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const fetchJoined = async () => {
            if (!userId) return;

            const { data } = await supabase
                .from("event_participants")
                .select("event_id")
                .eq("user_id", userId);

            setJoinedEvents(data?.map((d) => d.event_id) || []);
        };

        fetchJoined();
    }, [userId]);

    const getSportName = (event: Event) => {
        const s: any = event.sports;

        if (!s) return "Unknown sport";
        if (Array.isArray(s)) return s[0]?.name ?? "Unknown sport";
        return s.name ?? "Unknown sport";
    };

    const joinEvent = async (eventId: string) => {
        if (!userId) {
            navigate("/login");
            return;
        }

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

            {/* HEADER WITH BUTTONS */}
            <div className="dashboard-header">

                <h1 className="dashboard-title">Sports Hub</h1>

                <div className="top-actions">
                    <button
                        className="nav-button"
                        onClick={() => navigate("/chat")}
                    >
                        💬 Chat
                    </button>

                    <button
                        className="nav-button primary"
                        onClick={() => navigate("/event")}
                    >
                        ➕ Create Event
                    </button>

                    <button
                        className="nav-button"
                        onClick={() => navigate("/profile")}
                    >
                        👤 Profile
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            {loading && <p>Loading...</p>}

            <div className="events-grid">
                {events.map((event) => {
                    const isJoined = joinedEvents.includes(event.id);

                    return (
                        <div key={event.id} className="event-card">

                            <h3 className="event-title">
                                {event.title}
                            </h3>

                            <span className="event-sport">
                                {getSportName(event)}
                            </span>

                            <p className="event-desc">
                                {event.description}
                            </p>

                            <div className="event-meta">
                                📍 {event.location_name}
                            </div>

                            <div className="event-meta">
                                🕒{" "}
                                {new Date(event.start_time).toLocaleString()}
                            </div>

                            <div className="event-meta">
                                👥 Max {event.max_players}
                            </div>

                            {isJoined ? (
                                <button
                                    className="joined-button"
                                    disabled
                                >
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
        </div>
    );
}