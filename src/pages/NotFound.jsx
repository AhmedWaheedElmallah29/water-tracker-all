import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="text-center mt-[50px] text-text-primary flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="mb-5">The page you are looking for does not exist.</p>
            <Link to="/" className="inline-block px-6 py-3 border border-glass-border rounded-xl text-base font-semibold transition-all duration-300 backdrop-blur-[10px] bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">Go Home</Link>
        </div>
    );
};
export default NotFound;
