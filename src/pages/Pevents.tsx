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
    captain_id: string;

    sports?: Sport | Sport[] | null;
};

export default function PEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const navigate = useNavigate();

    // LOAD USER
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUserId(data.session?.user.id ?? null);
        };

        loadUser();
    }, []);

    // LOAD MY EVENTS
    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!userId) return;

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
                    captain_id,
                    sports (name)
                `)
                .eq("captain_id", userId)
                .order("event_date", { ascending: true });

            if (error) {
                console.error(error.message);
                setEvents([]);
            } else {
                setEvents((data as Event[]) || []);
            }

            setLoading(false);
        };

        fetchMyEvents();
    }, [userId]);

    // DELETE EVENT
    const deleteEvent = async (eventId: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmDelete) return;

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (error) {
            console.error(error.message);
            return;
        }

        // remove from UI instantly
        setEvents((prev) =>
            prev.filter((e) => e.id !== eventId)
        );
    };

    // SPORT NAME
    const getSportName = (event: Event) => {
        const sport = event.sports;

        if (!sport) return "Unknown Sport";

        if (Array.isArray(sport)) {
            return sport[0]?.name || "Unknown Sport";
        }

        return sport.name || "Unknown Sport";
    };

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">

                <div>
                    <h1 className="dashboard-title">
                        My Events
                    </h1>

                    <p className="dashboard-subtitle">
                        Events you created
                    </p>
                </div>

                <div className="top-actions">

                    <button
                        className="nav-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        🏠 Dashboard
                    </button>

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

                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <p className="loading-text">
                    Loading your events...
                </p>
            )}

            {/* EVENTS */}
            <div className="events-grid">

                {events.map((event) => (
                    <div
                        key={event.id}
                        className="event-card"
                    >

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
                            {new Date(
                                event.event_date
                            ).toLocaleDateString()}
                        </div>

                        <div className="event-meta">
                            🕒 {event.start_time} → {event.end_time}
                        </div>

                        <div className="event-meta">
                            👥 Max Players: {event.max_players}
                        </div>

                        {/* DELETE BUTTON */}
                        <button
                            className="delete-button"
                            onClick={() => deleteEvent(event.id)}
                        >
                            🗑 Delete Event
                        </button>

                        {/* OWNER LABEL */}
                        <button
                            className="joined-button"
                            disabled
                        >
                            👑 Your Event
                        </button>

                    </div>
                ))}

            </div>
        </div>
    );
}