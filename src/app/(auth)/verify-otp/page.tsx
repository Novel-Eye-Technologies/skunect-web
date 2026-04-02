"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { OtpInput } from "@/components/features/auth/otp-input";
import { useAuthStore } from "@/lib/stores/auth-store";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const otpReference = searchParams.get("ref");

  function handleSuccess() {
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.roles.length > 1) {
      router.push("/select-school");
    } else {
      router.push("/dashboard");
    }
  }

  useEffect(() => {
    if (!otpReference) {
      router.replace("/login");
    }
  }, [otpReference, router]);

  if (!otpReference) {
    return null;
  }

  return <OtpInput otpReference={otpReference} onSuccess={handleSuccess} />;
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
