"use client";

import { Check, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SchoolRoleInfo } from "@/lib/types/auth";

interface SchoolSelectCardProps {
  school: SchoolRoleInfo;
  onSelect: (schoolId: string) => void;
  isSelected: boolean;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-navy text-white",
  TEACHER: "bg-teal text-white",
  PARENT: "bg-sage text-navy",
};

export function SchoolSelectCard({
  school,
  onSelect,
  isSelected,
}: SchoolSelectCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected
          ? "border-teal ring-2 ring-teal/20 shadow-md"
          : "border-border hover:border-teal/40"
      )}
      onClick={() => onSelect(school.schoolId)}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(school.schoolId);
        }
      }}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {/* School icon */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors",
            isSelected ? "bg-teal/15 text-teal" : "bg-muted text-muted-foreground"
          )}
        >
          <GraduationCap className="w-6 h-6" />
        </div>

        {/* School info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {school.schoolName}
          </h3>
          <Badge
            className={cn(
              "mt-1.5 text-[11px] font-medium",
              roleColors[school.role] || "bg-muted text-foreground"
            )}
          >
            {roleLabels[school.role] || school.role}
          </Badge>
        </div>

        {/* Check indicator */}
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-all",
            isSelected
              ? "bg-teal text-white scale-100"
              : "border-2 border-muted-foreground/30 scale-90 opacity-0"
          )}
        >
          <Check className="w-3.5 h-3.5" />
        </div>
      </CardContent>
    </Card>
  );
}
