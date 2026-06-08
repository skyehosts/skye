"use client";

import {
  LogInOrSignUpEmailValues,
  LogInOrSignUpLoginValues,
  LogInOrSignUpModal,
  LogInOrSignUpSignUpValues,
  LogInOrSignUpStep,
} from "@repo/web-components/auth/log-in-or-sign-up-modal";
import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  ApiRequestError,
  ICheckEmailRequestDto,
  ICheckEmailResponseDto,
  ISignUpRequestDto,
  SignUpRole,
  fetchApi,
} from "../../../skye-hosts-api-client/src";
import { getDisplayError } from "@repo/web-components/forms/get-display-error";

const ROLE_LABELS: Record<SignUpRole, string> = {
  guest: "guest",
  host: "host",
};

export interface LogInOrSignUpModalWrapperProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  role: SignUpRole;
  logoSrc: string;
  logoAlt?: string;
}

export function LogInOrSignUpModalWrapper({
  open,
  onClose,
  onAuthenticated,
  role,
  logoSrc,
  logoAlt,
}: LogInOrSignUpModalWrapperProps) {
  const [step, setStep] = useState<LogInOrSignUpStep>("email");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setServerError(null);
    onClose();
  };

  const handleEmailSubmit = async (data: LogInOrSignUpEmailValues) => {
    setServerError(null);
    try {
      const response = await fetchApi<
        ICheckEmailResponseDto,
        ICheckEmailRequestDto
      >("/auth/check-email", { email: data.email });
      setEmail(data.email);
      setStep(response.exists ? "login" : "signup");
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  const handleLoginSubmit = async (data: LogInOrSignUpLoginValues) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setServerError("Invalid email or password");
        return;
      }

      onAuthenticated();
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  const handleSignUpSubmit = async (data: LogInOrSignUpSignUpValues) => {
    setServerError(null);
    try {
      await fetchApi<unknown, ISignUpRequestDto>("/auth/sign-up", {
        email,
        name: data.name,
        password: data.password,
        role,
        subscribedToNewsViaEmail: false,
      });

      const result = await signIn("credentials", {
        email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setServerError("Account created but sign-in failed. Please log in.");
        return;
      }

      onAuthenticated();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setServerError(
          e.statusCode === 409
            ? `An account with that email is registered as a ${ROLE_LABELS[role]} already. Please log in instead.`
            : e.message,
        );
        return;
      }
      setServerError(getDisplayError(e));
    }
  };

  return (
    <LogInOrSignUpModal
      open={open}
      onClose={handleClose}
      step={step}
      email={email}
      serverError={serverError}
      onEmailSubmit={handleEmailSubmit}
      onLoginSubmit={handleLoginSubmit}
      onSignUpSubmit={handleSignUpSubmit}
      logoSrc={logoSrc}
      logoAlt={logoAlt}
    />
  );
}
