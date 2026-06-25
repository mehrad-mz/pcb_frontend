import { Button } from "@/components/ui/button";

type AuthSubmitButtonProps = {
  loading: boolean;
  children: React.ReactNode;
};

export function AuthSubmitButton({ loading, children }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="auth-submit h-10 w-full rounded-lg"
      disabled={loading}
    >
      {loading ? "لطفاً صبر کنید..." : children}
    </Button>
  );
}
