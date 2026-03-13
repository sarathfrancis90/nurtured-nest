"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createFaqAction,
  createResourceAction,
  createServiceAction,
  createTestimonialAction
} from "@/app/actions";

type State = { ok: boolean; message: string };
const initialState: State = { ok: false, message: "" };

function Message({ state }: { state: State }) {
  if (!state.message) return null;
  return <p style={{ color: state.ok ? "#1f6e3f" : "#9f2f31", marginTop: 8 }}>{state.message}</p>;
}

export function ServiceCreateForm() {
  const [state, action, pending] = useActionState(createServiceAction, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="card" style={{ display: "grid", gap: 8 }}>
      <h3>Add Service</h3>
      <input name="title" placeholder="Title" required />
      <textarea name="description" placeholder="Description" required />
      <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={0} />
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? "Saving..." : "Add Service"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function FaqCreateForm() {
  const [state, action, pending] = useActionState(createFaqAction, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="card" style={{ display: "grid", gap: 8 }}>
      <h3>Add FAQ</h3>
      <input name="question" placeholder="Question" required />
      <textarea name="answer" placeholder="Answer" required />
      <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={0} />
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? "Saving..." : "Add FAQ"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function TestimonialCreateForm() {
  const [state, action, pending] = useActionState(createTestimonialAction, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="card" style={{ display: "grid", gap: 8 }}>
      <h3>Add Testimonial</h3>
      <textarea name="quote" placeholder="Quote" required />
      <input name="name" placeholder="Name" required />
      <input name="relationship" placeholder="Relationship" required />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" name="featured" style={{ width: "auto" }} /> Featured
      </label>
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? "Saving..." : "Add Testimonial"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function ResourceCreateForm() {
  const [state, action, pending] = useActionState(createResourceAction, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="card" style={{ display: "grid", gap: 8 }}>
      <h3>Add Resource</h3>
      <input name="title" placeholder="Title" required />
      <textarea name="excerpt" placeholder="Excerpt" required />
      <input name="slug" placeholder="slug" required />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" name="published" style={{ width: "auto" }} /> Published
      </label>
      <button className="btn btn-secondary" disabled={pending}>
        {pending ? "Saving..." : "Add Resource"}
      </button>
      <Message state={state} />
    </form>
  );
}
