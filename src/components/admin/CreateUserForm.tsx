"use client";

import { useState } from "react";
import { createUser } from "@/lib/actions/users";
import { UserRole } from "@prisma/client";

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await createUser(formData);
      setMessage({ type: "success", text: `User created successfully! ID Code: ${result.code}` });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to create user." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4 text-center">Grant Access (New User)</h2>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="e.g. John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="password">
            Temporary Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            defaultValue={UserRole.USER}
          >
            <option value={UserRole.USER}>Standard User</option>
            <option value={UserRole.ADMIN}>Administrator</option>
          </select>
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-md ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
