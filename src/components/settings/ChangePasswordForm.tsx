"use client";

import { useState } from "react";
import { changePassword } from "@/lib/actions/auth";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      await changePassword(formData);
      setMessage({ type: "success", text: "Password changed successfully!" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm max-w-md mt-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h2>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="password">
            New Password
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
          <label className="block text-sm text-neutral-700 mb-1" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
