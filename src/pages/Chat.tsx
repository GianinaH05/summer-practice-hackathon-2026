import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Chat.css";

type Event = {
    id: string;
    title: string;
};

type Profile = {
    id: string;
    username: string;
    profile_picture_url: string | null;
};

type Message = {
    id: string;
    event_id: string;
    message: string;
    user_id: string;
    created_at: string;
    profiles?: Profile | null;
};

export default function Chat() {
    const [userId, setUserId] = useState<string | null>(null);

    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] =
        useState<Event | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    // GET USER
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getSession();

            setUserId(data.session?.user.id ?? null);
        };

        loadUser();
    }, []);

    // LOAD USER EVENTS
    useEffect(() => {
        const loadEvents = async () => {
            if (!userId) return;

            // joined events
            const { data: joinedData } = await supabase
                .from("event_participants")
                .select("event_id")
                .eq("user_id", userId);

            const eventIds =
                joinedData?.map((j) => j.event_id) || [];

            if (eventIds.length === 0) {
                setEvents([]);
                return;
            }

            // event details
            const { data: eventsData } = await supabase
                .from("events")
                .select("id, title")
                .in("id", eventIds);

            setEvents(eventsData || []);
        };

        loadEvents();
    }, [userId]);

    // OPEN CHAT
    const openChat = async (event: Event) => {
        setSelectedEvent(event);

        // GET MESSAGES
        const { data: messagesData, error } = await supabase
            .from("event_messages")
            .select("*")
            .eq("event_id", event.id)
            .order("created_at", { ascending: true });

        if (error || !messagesData) {
            console.error(error);
            setMessages([]);
            return;
        }

        // UNIQUE USER IDS
        const userIds = Array.from(
            new Set(messagesData.map((m: any) => m.user_id))
        );

        // GET PROFILES
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, profile_picture_url")
            .in("id", userIds);

        // MERGE PROFILE INTO MESSAGE
        const formatted: Message[] = messagesData.map(
            (msg: any) => ({
                id: msg.id,
                event_id: msg.event_id,
                message: msg.message,
                user_id: msg.user_id,
                created_at: msg.created_at,

                profiles:
                    profilesData?.find(
                        (p) => p.id === msg.user_id
                    ) || null,
            })
        );

        setMessages(formatted);
    };

    // SEND MESSAGE
    const sendMessage = async () => {
        if (!selectedEvent || !text.trim() || !userId)
            return;

        const { error } = await supabase
            .from("event_messages")
            .insert({
                event_id: selectedEvent.id,
                user_id: userId,
                message: text,
            });

        if (error) {
            console.error(error.message);
            return;
        }

        setText("");

        // reload chat
        openChat(selectedEvent);
    };

    return (
        <div className="chat-container">

            {/* SIDEBAR */}
            <div className="chat-sidebar">
                <h3 className="chat-sidebar-title">
                    My Event Chats
                </h3>

                {events.length === 0 && (
                    <p className="empty-chat">
                        Join an event to access chats
                    </p>
                )}

                {events.map((event) => (
                    <div
                        key={event.id}
                        className={`chat-item ${
                            selectedEvent?.id === event.id
                                ? "active"
                                : ""
                        }`}
                        onClick={() => openChat(event)}
                    >
                        <div className="chat-avatar">
                            {event.title.charAt(0)}
                        </div>

                        <div className="chat-name">
                            {event.title}
                        </div>
                    </div>
                ))}
            </div>

            {/* CHAT WINDOW */}
            <div className="chat-window">
                {selectedEvent ? (
                    <>
                        {/* HEADER */}
                        <div className="chat-header">
                            <h2>{selectedEvent.title}</h2>
                        </div>

                        {/* MESSAGES */}
                        {/* MESSAGES */}
                        <div className="messages">
                            {messages.map((msg) => {
                                const isMine = msg.user_id === userId;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-wrapper ${
                                            isMine ? "mine-wrapper" : "other-wrapper"
                                        }`}
                                    >
                                        <div
                                            className={`message-card ${
                                                isMine ? "mine-card" : "other-card"
                                            }`}
                                        >
                                            {/* TOP */}
                                            <div className="message-top">
                                                <div className="message-user-row">
                                                    <div className="message-avatar">
                                                        {msg.profiles?.username
                                                            ?.charAt(0)
                                                            .toUpperCase() || "?"}
                                                    </div>

                                                    <span className="message-user">
                                {msg.profiles?.username || "Unknown"}
                            </span>
                                                </div>

                                                <span className="message-time">
                            {new Date(
                                msg.created_at
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                                            </div>

                                            {/* MESSAGE */}
                                            <div className="message-text">
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* INPUT */}
                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={text}
                                onChange={(e) =>
                                    setText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                            />

                            <button onClick={sendMessage}>
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-chat-window">
                        <h2>Select an event chat</h2>
                        <p>
                            Join an event to start chatting
                            with players
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}