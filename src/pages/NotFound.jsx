import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const NotFound = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px", color: "var(--text-primary)" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/" className="btn btn-secondary" style={{ display: "inline-block", marginTop: "20px" }}>Go Home</Link>
        </div>
    );
};
export default NotFound;
