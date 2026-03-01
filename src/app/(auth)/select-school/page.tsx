"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SchoolSelectCard } from "@/components/features/auth/school-select-card";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SelectSchoolPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setCurrentSchool = useAuthStore((s) => s.setCurrentSchool);
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    currentSchoolId
  );

  // Redirect if not authenticated or only one school
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.roles.length <= 1) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  function handleContinue() {
    if (!selectedSchoolId) return;
    setCurrentSchool(selectedSchoolId);
    router.push("/dashboard");
  }

  if (!user || user.roles.length <= 1) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
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
        Continue
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
