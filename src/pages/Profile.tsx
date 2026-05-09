import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../css/Profile.css";

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=User&background=0a3d66&color=ffffff&size=256";

type Sport = {
    id: string;
    name: string;
};

type UserSport = {
    sport_id: string;
    skill_level: string;
};

export default function Profile() {
    const [userId, setUserId] = useState<string | null>(null);

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);

    // GLOBAL skill (PROFILE LEVEL)
    const [globalSkill, setGlobalSkill] = useState("beginner");

    const [sports, setSports] = useState<Sport[]>([]);
    const [userSports, setUserSports] = useState<UserSport[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            const { data: session } = await supabase.auth.getSession();
            const id = session.session?.user.id;
            if (!id) return;

            setUserId(id);

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            setUsername(profile?.username || "Anonymous");
            setBio(profile?.bio || "");
            setAvatar(profile?.profile_picture_url ?? null);
            setGlobalSkill(profile?.skill_level || "beginner");

            const { data: sportsData } = await supabase
                .from("sports")
                .select("*");

            const { data: userSportsData } = await supabase
                .from("user_sports")
                .select("*")
                .eq("user_id", id);

            setSports(sportsData || []);
            setUserSports(userSportsData || []);

            setLoading(false);
        };

        loadAll();
    }, []);

    const isSelected = (sportId: string) =>
        userSports.some((s) => s.sport_id === sportId);

    const getSportSkill = (sportId: string) =>
        userSports.find((s) => s.sport_id === sportId)?.skill_level ||
        "beginner";

    const toggleSport = (sportId: string) => {
        if (!userId) return;

        if (isSelected(sportId)) {
            setUserSports((prev) =>
                prev.filter((s) => s.sport_id !== sportId)
            );
        } else {
            setUserSports((prev) => [
                ...prev,
                { sport_id: sportId, skill_level: "beginner" },
            ]);
        }
    };

    const updateSportSkill = (sportId: string, level: string) => {
        setUserSports((prev) =>
            prev.map((s) =>
                s.sport_id === sportId
                    ? { ...s, skill_level: level }
                    : s
            )
        );
    };

    const saveProfile = async () => {
        if (!userId) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                bio,
                profile_picture_url: avatar,
                skill_level: globalSkill,
            })
            .eq("id", userId);

        if (error) alert(error.message);
        else alert("Profile saved!");
    };

    const saveSports = async () => {
        if (!userId) return;

        await supabase
            .from("user_sports")
            .delete()
            .eq("user_id", userId);

        const inserts = userSports.map((s) => ({
            user_id: userId,
            sport_id: s.sport_id,
            skill_level: s.skill_level,
        }));

        const { error } = await supabase
            .from("user_sports")
            .insert(inserts);

        if (error) alert(error.message);
        else alert("Sports saved!");
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            <h1 className="dashboard-title">My Profile</h1>

            {/* PROFILE CARD */}
            <div className="profile-card">

                {/* 🔥 AVATAR FIX (CIRCLE WITH LETTER OR IMAGE) */}
                {avatar ? (
                    <img
                        src={avatar}
                        className="avatar-img"
                        alt="avatar"
                    />
                ) : (
                    <div className="avatar-fallback">
                        {username?.charAt(0).toUpperCase()}
                    </div>
                )}

                <p><strong>{username}</strong></p>

                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                {/* GLOBAL SKILL */}
                <select
                    value={globalSkill}
                    onChange={(e) => setGlobalSkill(e.target.value)}
                    className="profile-input"
                >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="master">Master</option>
                </select>

                <button className="save-button" onClick={saveProfile}>
                    Save Profile
                </button>
            </div>

            {/* SPORTS */}
            <h2 className="section-title">My Sports</h2>

            <div className="sports-row">
                {sports.map((sport) => {
                    const selected = isSelected(sport.id);

                    return (
                        <div
                            key={sport.id}
                            className={`sport-pill ${
                                selected ? "selected-sport" : ""
                            }`}
                            onClick={() => toggleSport(sport.id)}
                        >
                            <div>{sport.name}</div>

                            {/* SPORT SKILL */}
                            {selected && (
                                <select
                                    value={getSportSkill(sport.id)}
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                    onChange={(e) =>
                                        updateSportSkill(
                                            sport.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="beginner">
                                        Beginner
                                    </option>
                                    <option value="intermediate">
                                        Intermediate
                                    </option>
                                    <option value="master">
                                        Master
                                    </option>
                                </select>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                className="save-button"
                onClick={saveSports}
                style={{ marginTop: "15px" }}
            >
                Save Sports
            </button>
        </div>
    );
}