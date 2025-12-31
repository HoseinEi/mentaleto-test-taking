import React from "react";
import { Link } from "react-router-dom";
import { TELEGRAM_BOT_DEEPLINK_WEB } from "../config/app";

export default function Layout({ children }) {
    return (
        <>
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container">

                    {/* Brand */}
                    <Link className="navbar-brand fw-bold" to="/">
                        منتالتو
                    </Link>

                    {/* Mobile Toggle Button */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navbar Links */}
                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 mt-3 mt-lg-0">

                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    خانه
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/test/belbin_9_individual">
                                    تست بلبین
                                </Link>
                            </li>
                        </ul>

                        {/* Telegram Button */}
                        <a
                            className="btn btn-outline-primary mt-3 mt-lg-0"
                            href={TELEGRAM_BOT_DEEPLINK_WEB}
                            target="_blank"
                            rel="noreferrer"
                        >
                            ربات تلگرام
                        </a>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="container py-4">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="bg-light py-3 mt-5 border-top">
                <div className="container text-center small text-muted">
                    © {new Date().getFullYear()} منتالتو — تمام حقوق محفوظ است.
                </div>
            </footer>
        </>
    );
}
