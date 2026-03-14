"use client";

export default function Dashboard() {

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-4">
        Logged in with token:
      </p>

      <p className="text-sm text-gray-600 break-all">
        {token}
      </p>
    </div>
  );
}