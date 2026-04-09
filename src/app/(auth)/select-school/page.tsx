"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SchoolSelectCard } from "@/components/features/auth/school-select-card";
import { useAuthStore, useAuthHydrated } from "@/lib/stores/auth-store";

function SelectSchoolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const setCurrentSchool = useAuthStore((s) => s.setCurrentSchool);
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    currentSchoolId
  );

  // Redirect if not authenticated or only one school.
  // Wait for Zustand persist to restore state from localStorage before
  // checking — otherwise `user` is null during the hydration render cycle
  // and the page would incorrectly redirect to /login.
  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.roles.length <= 1) {
      router.replace("/dashboard");
    }
  }, [hydrated, user, router]);

  function handleContinue() {
    if (!selectedSchoolId) return;
    setCurrentSchool(selectedSchoolId);
    
    const returnUrl = searchParams.get("returnUrl");
    router.push(returnUrl || "/dashboard");
  }

  if (!hydrated || !user || user.roles.length <= 1) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Select a school
        </h2>
        <p className="text-sm text-muted-foreground">
          You have access to multiple schools. Choose which one to use.
        </p>
      </div>

      {/* School list */}
      <div className="space-y-3">
        {user.roles.map((schoolRole) => (
          <SchoolSelectCard
            key={schoolRole.schoolId}
            school={schoolRole}
            onSelect={setSelectedSchoolId}
            isSelected={selectedSchoolId === schoolRole.schoolId}
          />
        ))}
      </div>

      {/* Continue button */}
      <Button
        className="w-full h-11 bg-navy hover:bg-navy/90 text-white"
        disabled={!selectedSchoolId}
        onClick={handleContinue}
      >
        Continue to Dashboard
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

export default function SelectSchoolPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      }
    >
      <SelectSchoolContent />
    </Suspense>
  );
}
