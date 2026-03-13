"use client";

import { useActionState, useEffect } from "react";
import { submitLeadAction } from "@/app/actions";
import { defaultServices } from "@/lib/content";

type FormState = {
  ok: boolean;
  message: string;
};

const initialState: FormState = { ok: false, message: "" };

export function LeadForm() {
  const [state, action, pending] = useActionState(submitLeadAction, initialState);

  useEffect(() => {
    if (state.ok) {
      const form = document.getElementById("lead-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.ok]);

  return (
    <form id="lead-form" action={action} className="card form-grid">
      <div>
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" required />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" required />
      </div>
      <div>
        <label htmlFor="preferredContact">Preferred contact</label>
        <select id="preferredContact" name="preferredContact" required defaultValue="">
          <option value="" disabled>
            Select
          </option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>
      <div>
        <label htmlFor="city">City</label>
        <input id="city" name="city" required />
      </div>
      <div>
        <label htmlFor="estimatedDueDate">Estimated due date</label>
        <input id="estimatedDueDate" name="estimatedDueDate" type="date" required />
      </div>
      <div>
        <label htmlFor="birthSetting">Birth setting preference</label>
        <input id="birthSetting" name="birthSetting" placeholder="Hospital, birth center, home" required />
      </div>
      <div>
        <label>Services interested in</label>
        <div>
          {defaultServices.map((service) => (
            <label key={service.id} style={{ display: "block" }}>
              <input type="checkbox" name="interestedServices" value={service.title} style={{ width: "auto", marginRight: 8 }} />
              {service.title}
            </label>
          ))}
        </div>
      </div>
      <div className="full-width">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required />
      </div>
      <div className="full-width">
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="consent" required style={{ width: "auto" }} />
          I consent to being contacted about doula services.
        </label>
      </div>
      <div className="full-width">
        <input type="hidden" name="cf-turnstile-response" value="" />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting..." : "Submit Inquiry"}
        </button>
      </div>
      {state.message ? (
        <p className="full-width" style={{ color: state.ok ? "#1f6e3f" : "#9f2f31" }}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
