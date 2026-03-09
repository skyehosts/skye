import { Suspense } from "react";
import { ResetPasswordFormWrapper } from "./ResetPasswordFormWrapper";

export default function ResetPasswordPage() {
  return (
    <main>
      <h1>Reset password</h1>
      <Suspense>
        <ResetPasswordFormWrapper />
      </Suspense>
    </main>
  );
}
