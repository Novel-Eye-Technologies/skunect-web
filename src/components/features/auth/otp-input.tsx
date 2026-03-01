"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyOtp, useLogin } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  otpReference: string;
  onSuccess?: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function OtpInput({ otpReference, onSuccess }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyOtp = useVerifyOtp();
  const resendOtp = useLogin();

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-submit when all digits are filled
  const handleVerify = useCallback(
    async (otpValue: string) => {
      if (otpValue.length !== OTP_LENGTH) return;

      try {
        const response = await verifyOtp.mutateAsync({
          otpReference,
          otp: otpValue,
        });

        if (response.status === "SUCCESS") {
          setIsVerified(true);
          toast.success("Verification successful!");
          onSuccess?.();
        } else {
          toast.error(response.message || "Invalid OTP. Please try again.");
          setOtp(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Verification failed. Please try again.";
        toast.error(message);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    },
    [otpReference, verifyOtp, onSuccess]
  );

  function handleChange(index: number, value: string) {
    if (verifyOtp.isPending || isVerified) return;

    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    const fullOtp = newOtp.join("");
    if (fullOtp.length === OTP_LENGTH) {
      handleVerify(fullOtp);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (verifyOtp.isPending || isVerified) return;

    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (verifyOtp.isPending || isVerified) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (pastedData.length > 0) {
      const newOtp = Array(OTP_LENGTH).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === OTP_LENGTH) {
        handleVerify(pastedData);
      }
    }
  }

  function handleResend() {
    toast.info("Please go back and request a new OTP.");
    setCountdown(RESEND_COOLDOWN);
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isVerified) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal/10">
          <CheckCircle2 className="w-8 h-8 text-teal" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Verified!</h3>
          <p className="text-sm text-muted-foreground">
            Redirecting you now...
          </p>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Verify your identity
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent you
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={verifyOtp.isPending}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold",
              "focus-visible:border-teal focus-visible:ring-teal/30",
              otp[index] && "border-teal/50 bg-teal/5"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Loading state */}
      {verifyOtp.isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying...
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in{" "}
            <span className="font-semibold text-navy">
              {formatCountdown(countdown)}
            </span>
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-teal hover:text-teal/80 gap-1.5"
            onClick={handleResend}
            disabled={resendOtp.isPending}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Resend code
          </Button>
        )}
      </div>
    </div>
  );
}
