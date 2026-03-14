"use client";

import { useState } from "react";
import { signup } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    user_id: "",
    email: "",
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

    const res = await signup(form);

    if (res.message === "User registered successfully") {
      setMessage("Signup successful!");
      router.push("/login");
    } else {
      setMessage(res.message || "Error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Signup</h1>

        <input
          name="user_id"
          placeholder="User ID"
          onChange={handleChange}
          className="w-full p-2 border mb-4"
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
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

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Signup
        </button>

        {message && (
          <p className="mt-4 text-red-500">{message}</p>
        )}
      </form>

    </div>
  );
}