import React from "react";

export default function ErrorMessage({ title, text }) {
    return (
        <div className="alert alert-danger">
            <h4 className="alert-heading">{title}</h4>
            <p className="mb-0">{text}</p>
        </div>
    );
}
