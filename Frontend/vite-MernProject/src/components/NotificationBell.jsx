import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../utils/api"; // apne project ke path ke hisaab se change karein
import useClickOutside from "../hooks/useClickOutside"; // agar hook bana hua hai

import { notificationStyles as s } from "../assets/dummyStyles";

const verb = (type) =>
    type === "vote" ? "voted on your poll" : "commented on your poll";

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);

    const ref = useRef(null);

    useClickOutside(ref, () => setOpen(false), open);

    // Load notifications
    const load = async () => {
        try {
            const { data } = await api.get("/notification");

            setItems(data.items || []);
            setUnread(data.unread || 0);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    useEffect(() => {
        load();

        const interval = setInterval(load, 30000);

        return () => clearInterval(interval);
    }, []);

    // Open/Close dropdown
    const toggle = async () => {
        const next = !open;
        setOpen(next);

        if (next && unread > 0) {
            try {
                await api.patch("/notification/mark-read");
                setUnread(0);
            } catch (error) {
                console.error("Failed to mark notifications as read:", error);
            }
        }
    };

    return (
        <div className={s.container} ref={ref}>
            <button onClick={toggle} className={s.bellButton}>
                <Bell size={16} />

                {unread > 0 && <span className={s.badgeDot}></span>}
            </button>

            {open && (
                <div className={s.dropdown}>
                    <div className={s.header}>
                        <p className={s.headerText}>Notifications</p>
                    </div>

                    {items.length === 0 ? (
                        <p className={s.emptyText}>No notifications yet.</p>
                    ) : (
                        items.map((n) => (
                            <Link
                                key={n._id}
                                to={n.poll ? `/poll/${n.poll._id}` : "/dashboard"}
                                onClick={() => setOpen(false)}
                                className={`${s.notificationLink} ${!n.read ? s.notificationUnread : ""
                                    }`}
                            >
                                <span className={s.notificationText}>
                                    <span className={s.actorName}>
                                        @{n.actor?.username || "Unknown"}
                                    </span>{" "}
                                    {verb(n.type)}
                                    {n.poll?.question && (
                                        <span className={s.pollPreview}>
                                            {" "}
                                            · "{n.poll.question.slice(0, 40)}"
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;