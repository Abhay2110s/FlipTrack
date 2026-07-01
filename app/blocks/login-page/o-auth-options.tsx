import { getSupabaseBrowserClient } from "~/utils/supabase.client";
import styles from "./o-auth-options.module.css";

interface Props { className?: string; }

export function OAuthOptions({ className }: Props) {
  const handleGoogleLogin = async () => {
    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.divider}>
        <div className={styles.line} />
        <span className={styles.dividerText}>or continue with</span>
        <div className={styles.line} />
      </div>
      <button type="button" className={styles.googleBtn} onClick={() => void handleGoogleLogin()}>
        <span className={styles.googleIcon}>G</span>
        Continue with Google
      </button>
    </div>
  );
}
