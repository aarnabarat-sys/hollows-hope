import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import logoImg from "/assets/uploads/WhatsApp-Image-2026-03-19-at-6.36.29-PM-1.jpeg";

export function AuthPage() {
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-card p-8 sm:p-10 text-center border border-border">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-md">
              <img
                src={logoImg}
                alt="Hollows Hope"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Hollows Hope
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            Your safe space to reflect, grow, and heal.
          </p>

          <div className="space-y-3 text-sm text-muted-foreground bg-muted rounded-xl p-4 mb-8 text-left">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                Write personalised diary entries with AI-powered prompts
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Track your weekly mood patterns and emotional journey</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Chat with your empathetic AI companion anytime</span>
            </div>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base py-6"
            data-ocid="auth.primary_button"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In / Create Account"
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Secured by Internet Identity. Your data is yours.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
