import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
