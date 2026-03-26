'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PricingCalculatorProps {
  studentCount: number;
  onStudentCountChange: (count: number) => void;
  isBeta?: boolean;
  discountPercent?: number;
}

const STANDARD_ANNUAL_PRICE = 60_000;
const STANDARD_TERM_PRICE = 20_000;

export function PricingCalculator({
  studentCount,
  onStudentCountChange,
  isBeta = true,
  discountPercent = 20,
}: PricingCalculatorProps) {
  const multiplier = (100 - discountPercent) / 100;
  const discountedAnnual = Math.round(STANDARD_ANNUAL_PRICE * multiplier);
  const discountedTerm = Math.round(STANDARD_TERM_PRICE * multiplier);

  const totalAnnual = discountedAnnual * studentCount;
  const totalTerm = discountedTerm * studentCount;

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Student Count Input */}
      <div>
        <Label htmlFor="studentCount">Expected number of students</Label>
        <Input
          id="studentCount"
          type="number"
          min={1}
          max={5000}
          value={studentCount || ''}
          onChange={(e) => onStudentCountChange(parseInt(e.target.value) || 0)}
          className="mt-1"
          placeholder="e.g. 200"
        />
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Annual Plan
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(STANDARD_ANNUAL_PRICE)}
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatNaira(discountedAnnual)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">/student/year</p>
          {studentCount > 0 && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Total estimate ({studentCount} students)
              </p>
              <p className="text-lg font-semibold">{formatNaira(totalAnnual)}</p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Termly Plan
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(STANDARD_TERM_PRICE)}
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatNaira(discountedTerm)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">/student/term</p>
          {studentCount > 0 && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Total estimate ({studentCount} students)
              </p>
              <p className="text-lg font-semibold">{formatNaira(totalTerm)}</p>
              <p className="text-xs text-muted-foreground">/term</p>
            </div>
          )}
        </div>
      </div>

      {isBeta && (
        <div className="rounded-lg bg-teal/10 p-4 text-center">
          <p className="text-sm font-medium text-teal">
            Free during beta period (until August 2026)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {discountPercent}% discount applies after beta ends
          </p>
        </div>
      )}
    </div>
  );
}
