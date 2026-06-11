import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Shield } from "lucide-react";
import { login } from "@/lib/api/auth.server";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SecureSuite" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ data: { username, password } });
      toast.success("Logged in successfully");
      await router.invalidate();
      await navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md surface-card p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your SecureSuite account.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Email</Label>
            <Input 
              id="username" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="name@company.com" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Demo: Admin@insuretechs.com / Admin@123
        </div>
      </div>
    </div>
  );
}
