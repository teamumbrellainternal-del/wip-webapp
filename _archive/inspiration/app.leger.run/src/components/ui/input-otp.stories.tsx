import type { Story } from "@ladle/react";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Label } from "./label";

export const FourDigit: Story = () => {
  const [value, setValue] = useState("");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>4-Digit PIN</CardTitle>
          <CardDescription>Enter your 4-digit PIN code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={value} onChange={setValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {value ? `Entered: ${value}` : "Enter your PIN"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const SixDigit: Story = () => {
  const [value, setValue] = useState("");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>6-Digit Verification Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={value} onChange={setValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {value.length === 6 ? "✓ Code complete" : `${value.length}/6 digits`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const WithSeparator: Story = () => {
  const [value, setValue] = useState("");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Code with Separator</CardTitle>
          <CardDescription>
            Visual separator between groups of digits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={value} onChange={setValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Code: {value || "---•---"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const TwoFactorAuth: Story = () => {
  const [value, setValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      setTimeout(() => {
        setVerified(false);
        setValue("");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Authentication Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={value}
                onChange={setValue}
                disabled={isVerifying || verified}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={value.length !== 6 || isVerifying || verified}
            className="w-full"
          >
            {isVerifying
              ? "Verifying..."
              : verified
              ? "✓ Verified"
              : "Verify Code"}
          </Button>

          {verified && (
            <p className="text-center text-sm text-green-600">
              Authentication successful!
            </p>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <button className="text-primary hover:underline">
              Didn't receive a code?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PhoneVerification: Story = () => {
  const [value, setValue] = useState("");
  const [step, setStep] = useState<"enter" | "success">("enter");

  const handleSubmit = () => {
    if (value.length === 6) {
      setStep("success");
      setTimeout(() => {
        setStep("enter");
        setValue("");
      }, 3000);
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Phone Number</CardTitle>
          <CardDescription>
            We sent a verification code to +1 (555) 123-4567
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "enter" ? (
            <>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={value} onChange={setValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={value.length !== 6}
                className="w-full"
              >
                Verify Number
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button variant="link" size="sm">
                  Resend Code
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Phone Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Your phone number has been successfully verified.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const WithError: Story = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (error) setError("");

    if (newValue.length === 6) {
      // Simulate validation
      if (newValue !== "123456") {
        setError("Invalid code. Please try again.");
      }
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Code Verification</CardTitle>
          <CardDescription>
            Try entering "123456" for success, anything else for error
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={value} onChange={handleChange}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
            {value === "123456" && (
              <p className="text-center text-sm text-green-600">
                ✓ Code verified successfully!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DisabledState: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Disabled OTP Input</CardTitle>
          <CardDescription>Input is disabled and cannot be edited</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value="123456" disabled>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            This code has already been used
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const BackupCodes: Story = () => {
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [activeField, setActiveField] = useState<1 | 2>(1);

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Backup Verification Codes</CardTitle>
          <CardDescription>
            Enter any of your backup codes to verify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Backup Code 1</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={code1}
                  onChange={(val) => {
                    setCode1(val);
                    setActiveField(1);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">or</div>

            <div className="space-y-2">
              <Label>Backup Code 2</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={code2}
                  onChange={(val) => {
                    setCode2(val);
                    setActiveField(2);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <Button
            disabled={
              (activeField === 1 ? code1.length : code2.length) !== 8
            }
            className="w-full"
          >
            Verify with Backup Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
