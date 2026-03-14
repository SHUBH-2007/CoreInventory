"use client";

import { useState } from "react";
import { login } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    user_id: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form);

    if (res.token) {
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } else {
      setMessage(res.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <input
          name="user_id"
          placeholder="User ID"
          onChange={handleChange}
          className="w-full p-2 border mb-4"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          className="w-full p-2 border mb-4"
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Login
        </button>

        {message && (
          <p className="mt-4 text-red-500">{message}</p>
        )}
      </form>

    </div>
  );
}