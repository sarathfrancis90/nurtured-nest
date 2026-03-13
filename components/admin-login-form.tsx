"use client";

import { useActionState, useEffect } from "react";
import { adminSignInAction } from "@/app/actions";

type FormState = {
  ok: boolean;
  message: string;
};

const initialState: FormState = { ok: false, message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminSignInAction, initialState);
  useEffect(() => {
    if (state.ok) {
      window.location.href = "/admin";
    }
  }, [state.ok]);

  return (
    <form action={action} className="card" style={{ maxWidth: 460 }}>
      <h2>Admin Login</h2>
      <p>Sign in to manage content, leads, and settings.</p>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password" style={{ marginTop: 12 }}>
        Password
      </label>
      <input id="password" name="password" type="password" required />
      <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={pending}>
        {pending ? "Signing In..." : "Sign In"}
      </button>
      {state.message ? <p style={{ color: state.ok ? "#1f6e3f" : "#9f2f31" }}>{state.message}</p> : null}
    </form>
  );
}
