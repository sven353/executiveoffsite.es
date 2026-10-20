"use client";

import { useActionState, useTransition } from "react";
import type { ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

// React 19 clears uncontrolled fields after a <form action>. That would wipe what a person typed
// when validation fails, so submit through onSubmit instead and keep the values on screen.
export function useFormAction(action: Action) {
  const [state, formAction, actionPending] = useActionState(action, {} as ActionState);
  const [transitionPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(() => formAction(data));
  }

  return { state, onSubmit, pending: actionPending || transitionPending };
}
