import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@components/ui/dialog.tsx";
import { Button } from "@components/ui/button.tsx";
import { Input } from "@components/ui/input.tsx";
import { useGetUserInvite, useUseInvite, useLogin } from "@/api/generated/backend-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InviteRedemptionModalProps {
  inviteToken: string;
  onClose: () => void;
}

export function InviteRedemptionModal({ inviteToken, onClose }: InviteRedemptionModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  // Fetch invite details to validate and see if username is pre-filled
  const {
    data: inviteData,
    isLoading: isLoadingInvite,
    isError: isInviteError,
  } = useGetUserInvite(inviteToken, {
    query: {
      retry: false,
      enabled: !!inviteToken,
    }
  });

  // Mutation to register the user
  const { mutate: registerUser, isPending: isRegistering } = useUseInvite();
  
  // Mutation to auto-login after registration (optional, but good UX)
  const { mutate: login } = useLogin();

  useEffect(() => {
    if (inviteData?.username) {
      setUsername(inviteData.username);
    }
  }, [inviteData]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!username) {
      toast.error("Username is required");
      return;
    }

    registerUser(
      {
        secretKey: inviteToken,
        data: { username, password },
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          // Attempt auto-login
          login(
            { data: { username, password } },
            {
              onSuccess: () => {
                toast.success("Logged in successfully");
                window.location.reload(); // Reload to refresh app state/auth context
              },
              onError: () => {
                toast.info("Please log in with your new account.");
                handleClose();
              }
            }
          );
        },
        onError: () => {
          toast.error("Failed to create account. The invite might be invalid or expired.");
        },
      }
    );
  };

  // If explicitly closed or token is missing
  if (!inviteToken) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="font-mono sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Invitation</DialogTitle>
          <DialogDescription>
            Create your account to join the server yard.
          </DialogDescription>
        </DialogHeader>

        {isLoadingInvite ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isInviteError ? (
          <div className="py-4 text-center space-y-4">
            <p className="text-destructive font-medium">Invalid or expired invite link.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {inviteData?.invited_by && (
               <p className="text-sm text-muted-foreground text-center mb-4">
                 Invited by <span className="font-bold text-foreground">{inviteData.invited_by}</span>
               </p>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                disabled={!!inviteData?.username || isRegistering} // Disable if pre-set by invite
              />
              {inviteData?.username && (
                <p className="text-[0.8em] text-muted-foreground">
                  * Username set by inviter
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isRegistering}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isRegistering}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isRegistering}>
                Cancel
              </Button>
              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                ) : (
                    "Create Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
