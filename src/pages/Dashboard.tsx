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

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const [userId, setUserId] = useState<string | null>(null);
    const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

    const navigate = useNavigate();

    // LOAD USER
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();

            setUserId(data.session?.user.id ?? null);
        };

        loadUser();
    }, []);

    // LOAD EVENTS
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
                    sports (
                        name
                    )
                `)
                .order("event_date", {
                    ascending: true,
                });

            if (error) {
                console.error(error.message);
                setEvents([]);
            } else {
                setEvents((data as Event[]) || []);
            }

            setLoading(false);
        };

        fetchEvents();
    }, []);

    // LOAD JOINED EVENTS
    useEffect(() => {
        const fetchJoined = async () => {
            if (!userId) return;

            const { data } = await supabase
                .from("event_participants")
                .select("event_id")
                .eq("user_id", userId);

            setJoinedEvents(
                data?.map((d: any) => d.event_id) || []
            );
        };

        fetchJoined();
    }, [userId]);

    // GET SPORT NAME
    const getSportName = (event: Event) => {
        const sport = event.sports;

        if (!sport) return "Unknown Sport";

        if (Array.isArray(sport)) {
            return sport[0]?.name || "Unknown Sport";
        }

        return sport.name || "Unknown Sport";
    };

    // JOIN EVENT
    const joinEvent = async (eventId: string) => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const alreadyJoined =
            joinedEvents.includes(eventId);

        if (alreadyJoined) return;

        const { error } = await supabase
            .from("event_participants")
            .insert({
                event_id: eventId,
                user_id: userId,
                joined_at: new Date().toISOString(),
            });

        if (error) {
            console.error(error.message);
            return;
        }

        setJoinedEvents((prev) => [
            ...prev,
            eventId,
        ]);
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
                        Join games and meet players
                    </p>
                </div>

                {/* NAVIGATION */}
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
                        onClick={() => navigate("/pevents")}
                    >
                        🏆 My Events
                    </button>

                    <button
                        className="nav-button"
                        onClick={() => navigate("/profile")}
                    >
                        👤 Profile
                    </button>

                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <p className="loading-text">
                    Loading events...
                </p>
            )}

            {/* EMPTY */}
            {!loading && events.length === 0 && (
                <p className="empty-text">
                    No events found
                </p>
            )}

            {/* EVENTS */}
            <div className="events-grid">

                {events.map((event) => {
                    const isJoined =
                        joinedEvents.includes(event.id);

                    return (
                        <div
                            key={event.id}
                            className="event-card"
                        >

                            {/* SPORT */}
                            <div className="event-sport">
                                {getSportName(event)}
                            </div>

                            {/* TITLE */}
                            <h2 className="event-title">
                                {event.title}
                            </h2>

                            {/* DESCRIPTION */}
                            <p className="event-desc">
                                {event.description}
                            </p>

                            {/* LOCATION */}
                            <div className="event-meta">
                                📍 {event.location_name}
                            </div>

                            {/* DATE */}
                            <div className="event-meta">
                                📅{" "}
                                {new Date(
                                    event.event_date
                                ).toLocaleDateString()}
                            </div>

                            {/* TIME */}
                            <div className="event-meta">
                                🕒 {event.start_time} →{" "}
                                {event.end_time}
                            </div>

                            {/* PLAYERS */}
                            <div className="event-meta">
                                👥 Max Players:{" "}
                                {event.max_players}
                            </div>

                            {/* BUTTON */}
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
                                    onClick={() =>
                                        joinEvent(event.id)
                                    }
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