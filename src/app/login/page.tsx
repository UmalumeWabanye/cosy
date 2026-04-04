"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    alert("LOGIN HANDLER CALLED");
    console.log("LOGIN HANDLER CALLED: Email =", email);

    try {
      // Change this URL if your backend is remote!
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      alert("Login API responded: " + JSON.stringify(data));
      console.log("Login API responded:", data);

      if (!res.ok) {
        alert("Login failed: " + (data?.message || res.status));
        return;
      }

      // Adjust to your backend's property for role!
      if (data && data.user && data.user.role) {
        if (data.user.role === "admin") {
          alert("Redirecting to /admin/dashboard");
          window.location.href = "/admin/dashboard";
        } else {
          alert("Redirecting to /dashboard");
          window.location.href = "/dashboard";
        }
      } else {
        alert("Unexpected/invalid response from API. No user/role found.");
      }
    } catch (err) {
      alert("Login error: " + err.message);
      console.error("Login error:", err);
    }
  }

  return (
    <main>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          autoComplete="email"
          required
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          autoComplete="current-password"
          required
          placeholder="Your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </main>
  );
}
