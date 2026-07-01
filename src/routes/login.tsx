import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Baapedu" },
      { name: "description", content: "Sign in to your Baapedu learning workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="grid min-h-screen bg-hero-gradient lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 lg:flex">
        <Link to="/"><Logo /></Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Learn Smarter.
            <br />
            <span className="text-primary">Achieve More.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to continue your learning journey with Baapedu.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Baapedu — Smart Learning, Better Future
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you'd like to sign in.
          </p>

          <Tabs defaultValue="password" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Email / Password</TabsTrigger>
              <TabsTrigger value="otp">Phone OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="password" className="mt-6">
              <PasswordForm />
            </TabsContent>
            <TabsContent value="otp" className="mt-6">
              <OtpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function extractSession(resp: any) {
  const token =
    resp?.token ||
    resp?.access_token ||
    resp?.data?.token ||
    resp?.data?.access_token;
  const user =
    resp?.user ||
    resp?.data?.user ||
    (resp?.user_id ? { id: resp.user_id, name: resp?.name } : null);
  return { token, user };
}

function PasswordForm() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload =
        mode === "email"
          ? { email: identifier, password }
          : { phone: identifier, country_code: countryCode, password };
      const resp = await authApi.loginPassword(payload);
      const { token, user } = extractSession(resp);
      if (!token || !user) throw new Error("Invalid credentials response");
      setSession({ token, user: { ...user, id: user.id || user.user_id } });
      toast.success("Signed in");
      navigate({ to: "/organizations" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`rounded-full px-3 py-1 font-medium ${mode === "email" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`rounded-full px-3 py-1 font-medium ${mode === "phone" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          Phone
        </button>
      </div>

      {mode === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <Input className="w-20" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
            <Input id="phone" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="8208507318" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </form>
  );
}

function OtpForm() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestOtp({ phone, country_code: countryCode });
      toast.success("OTP sent");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await authApi.verifyOtp({ phone, country_code: countryCode, otp });
      const { token, user } = extractSession(resp);
      if (!token || !user) throw new Error("Invalid OTP response");
      setSession({ token, user: { ...user, id: user.id || user.user_id } });
      toast.success("Verified");
      navigate({ to: "/organizations" });
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "phone")
    return (
      <form onSubmit={requestOtp} className="space-y-4">
        <div className="space-y-2">
          <Label>Phone number</Label>
          <div className="flex gap-2">
            <Input className="w-20" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
            <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="8208507318" />
          </div>
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send OTP
        </Button>
      </form>
    );

  return (
    <form onSubmit={verify} className="space-y-4">
      <div className="space-y-2">
        <Label>Enter 6-digit OTP sent to {countryCode} {phone}</Label>
        <Input required inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
      </div>
      <Button className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Verify & sign in
      </Button>
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => setStep("phone")}>
        Change number
      </button>
    </form>
  );
}
