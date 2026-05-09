import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Event.css";

type Sport = {
    id: string;
    name: string;
};

export default function Event() {
    const [sports, setSports] = useState<Sport[]>([]);

    const [title, setTitle] = useState("");
    const [sportId, setSportId] = useState("");

    const [location, setLocation] = useState("");

    const [eventDate, setEventDate] = useState("");

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [maxPlayers, setMaxPlayers] =
        useState<number>(10);

    const [description, setDescription] =
        useState("");

    // LOAD SPORTS
    useEffect(() => {
        const loadSports = async () => {
            const { data, error } = await supabase
                .from("sports")
                .select("id, name")
                .order("name");

            if (error) {
                console.error(error.message);
                return;
            }

            setSports(data || []);
        };

        loadSports();
    }, []);

    // CREATE EVENT
    const createEvent = async () => {
        const { data: userData } =
            await supabase.auth.getUser();

        const userId = userData.user?.id;

        if (!userId) {
            alert("You must be logged in");
            return;
        }

        if (
            !title ||
            !sportId ||
            !location ||
            !eventDate ||
            !startTime ||
            !endTime
        ) {
            alert("Please fill all fields");
            return;
        }

        const { error } = await supabase
            .from("events")
            .insert({
                title,

                description,

                sport_id: sportId,

                location_name: location,

                event_date: eventDate,

                start_time: startTime,

                end_time: endTime,

                max_players: maxPlayers,

                captain_id: userId,
            });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Event created!");

        // RESET
        setTitle("");
        setSportId("");
        setLocation("");
        setEventDate("");
        setStartTime("");
        setEndTime("");
        setMaxPlayers(10);
        setDescription("");
    };

    return (
        <div className="event-container">

            <h1 className="event-title">
                Create Event
            </h1>

            <div className="event-form">

                {/* TITLE */}
                <input
                    type="text"
                    placeholder="Event title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                />

                {/* SPORT */}
                <select
                    value={sportId}
                    onChange={(e) =>
                        setSportId(e.target.value)
                    }
                >
                    <option value="">
                        Select sport
                    </option>

                    {sports.map((sport) => (
                        <option
                            key={sport.id}
                            value={sport.id}
                        >
                            {sport.name}
                        </option>
                    ))}
                </select>

                {/* LOCATION */}
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) =>
                        setLocation(e.target.value)
                    }
                />

                {/* EVENT DATE */}
                <div className="time-group">
                    <label>Event Date</label>

                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) =>
                            setEventDate(
                                e.target.value
                            )
                        }
                    />
                </div>

                {/* START TIME */}
                <div className="time-group">
                    <label>Start Time</label>

                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) =>
                            setStartTime(
                                e.target.value
                            )
                        }
                    />
                </div>

                {/* END TIME */}
                <div className="time-group">
                    <label>End Time</label>

                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) =>
                            setEndTime(
                                e.target.value
                            )
                        }
                    />
                </div>

                {/* MAX PLAYERS */}
                <input
                    type="number"
                    min="2"
                    placeholder="Max players"
                    value={maxPlayers}
                    onChange={(e) =>
                        setMaxPlayers(
                            Number(e.target.value)
                        )
                    }
                />

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                />

                {/* BUTTON */}
                <button onClick={createEvent}>
                    Create Event
                </button>
            </div>
        </div>
    );
}