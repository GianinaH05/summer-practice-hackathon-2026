import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";

type Sport = {
    name: string;
};

type Event = {
    id: string;
    title: string;
    description: string;
    location_name: string;
    start_time: string;
    end_time: string;

    sports?: Sport | Sport[] | null;
};

export default function Home() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
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
                    start_time,
                    end_time,
                    sports (name)
                `)
                .order("start_time", { ascending: true });

            console.log("DATA:", data);
            console.log("ERROR:", error);

            if (!error) {
                setEvents((data as Event[]) || []);
            } else {
                setEvents([]);
            }

            setLoading(false);
        };

        fetchEvents();
    }, []);

    // safe sport getter (handles all Supabase formats)
    const getSportName = (event: Event) => {
        const s: any = event.sports;

        if (!s) return "Unknown sport";
        if (Array.isArray(s)) return s[0]?.name ?? "Unknown sport";
        return s.name ?? "Unknown sport";
    };

    return (
        <div className="home-container">

            {/* HEADER */}
            <h1 className="home-title">Sports Events</h1>
            <p className="home-subtitle">
                Browse upcoming games and join players near you
            </p>

            {/* STATES */}
            {loading && (
                <p className="loading-text">Loading events...</p>
            )}

            {!loading && events.length === 0 && (
                <p className="empty-text">No events yet...</p>
            )}

            {/* EVENTS */}
            <div className="events-grid">
                {events.map((event) => (
                    <div key={event.id} className="event-card">

                        <div className="event-header">
                            <h3 className="event-title">
                                {event.title}
                            </h3>

                            <span className="event-sport">
                                {getSportName(event)}
                            </span>
                        </div>

                        <p className="event-meta">
                            📍 {event.location_name}
                        </p>

                        <p className="event-meta">
                            🕒{" "}
                            {new Date(event.start_time).toLocaleString()}{" "}
                            →{" "}
                            {new Date(event.end_time).toLocaleString()}
                        </p>
                        <button
                            className="aero-button"
                            onClick={() => navigate("/login")}
                        >
                            Login to join
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}