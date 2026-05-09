import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Event.css";

export default function Event() {
    const [title, setTitle] = useState("");
    const [sport, setSport] = useState("");
    const [location, setLocation] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");

    const createEvent = async () => {
        const { data: userData } = await supabase.auth.getUser();

        const { error } = await supabase.from("events").insert({
            title,
            sport,
            location,
            time,
            description,
            created_by: userData.user?.id,
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Event created!");

        setTitle("");
        setSport("");
        setLocation("");
        setTime("");
        setDescription("");
    };

    return (
        <div className="event-container">
            <h1>Create Event</h1>

            <div className="event-form">
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    placeholder="Sport"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                />

                <input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <input
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button onClick={createEvent}>Create Event</button>
            </div>
        </div>
    );
}