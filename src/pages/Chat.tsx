import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Chat.css";

type Chat = {
    id: string;
    name: string;
};

type Message = {
    id: string;
    chat_id: string;
    content: string;
    sender_id: string;
};

export default function Chat() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    const user = supabase.auth.getUser();

    useEffect(() => {
        const loadChats = async () => {
            const { data } = await supabase.from("chats").select("*");
            setChats(data || []);
        };

        loadChats();
    }, []);

    const openChat = async (chat: Chat) => {
        setSelectedChat(chat);

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: true });

        setMessages(data || []);
    };

    const sendMessage = async () => {
        if (!selectedChat || !text) return;

        const { data: userData } = await supabase.auth.getUser();

        await supabase.from("messages").insert({
            chat_id: selectedChat.id,
            content: text,
            sender_id: userData.user?.id,
        });

        setText("");
        openChat(selectedChat);
    };

    return (
        <div className="chat-container">
            {/* LEFT SIDE */}
            <div className="chat-sidebar">
                <h3>Chats</h3>

                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item ${
                            selectedChat?.id === chat.id ? "active" : ""
                        }`}
                        onClick={() => openChat(chat)}
                    >
                        {chat.name}
                    </div>
                ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <h3>{selectedChat.name}</h3>

                        <div className="messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className="message">
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <div className="chat-input">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <p>Select a chat</p>
                )}
            </div>
        </div>
    );
}