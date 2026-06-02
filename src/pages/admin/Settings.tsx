import { useEffect, useState } from "react";

import { Building2, Send, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/components/admin/AdminContext";
import { AccountForm } from "@/components/admin/shared";

export default function Settings() {
  const {
    commissionPct,
    setCommissionPct,
    businessAccount,
    setBusinessAccount,
  } = useAdmin();

  const [sendCommissionOpen, setSendCommissionOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalCommission = 0;

  const loadSuperAdminDetails = async () => {
    try {
      const raw = localStorage.getItem("admin_session");

      if (!raw) {
        return;
      }

      const admin = JSON.parse(raw);

      const response = await fetch(
        `https://munchezserver.onrender.com/api/v1/super-admin-details/${encodeURIComponent(
          admin.email
        )}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        setCommissionPct(
          Number(
            result.data?.commissionPercent ??
              result.data?.commissionPercentage ??
              0
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load commission settings");
    }
  };

  useEffect(() => {
    loadSuperAdminDetails();
  }, []);

  const updateSuperAdmin = async () => {
    try {
      const raw = localStorage.getItem("admin_session");

      if (!raw) {
        toast.error("Admin session not found");
        return;
      }

      const admin = JSON.parse(raw);

      setIsSaving(true);

      const response = await fetch(
        `https://munchezserver.onrender.com/api/v1/update-super-admin/${encodeURIComponent(
          admin.email
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            commissionPercent: commissionPct,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Update failed");
      }

      await loadSuperAdminDetails();

      toast.success("Commission updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update commission");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendCommission = () => {
    toast.success(
      `Sent GH₵${totalCommission.toLocaleString()} commission to ${businessAccount.accountName}`
    );
    setSendCommissionOpen(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Commission
          </h3>
          <p className="text-sm text-muted-foreground">
            Percentage of restaurant revenue collected as commission.
          </p>
        </div>

        <div className="flex items-end gap-3 max-w-sm">
          <div className="flex-1 space-y-1">
            <Label>Commission %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={commissionPct}
              onChange={(e) =>
                setCommissionPct(Number(e.target.value))
              }
            />
          </div>

          <Button
            disabled={isSaving}
            onClick={updateSuperAdmin}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business recipient account
          </h3>

          <p className="text-sm text-muted-foreground">
            Where your commission from all restaurants will be sent.
          </p>
        </div>

        <AccountForm
          value={businessAccount}
          onChange={setBusinessAccount}
        />

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-muted-foreground">
              Recipient
            </p>

            <p className="text-lg font-semibold">
              {businessAccount.accountName}
            </p>
          </div>

          <Button
            onClick={() => setSendCommissionOpen(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Send commission to business account
          </Button>
        </div>
      </Card>

      <Dialog
        open={sendCommissionOpen}
        onOpenChange={setSendCommissionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send commission</DialogTitle>

            <DialogDescription>
              Sending commission to{" "}
              <b>{businessAccount.accountName}</b> (
              {businessAccount.provider} •{" "}
              {businessAccount.accountNumber}).
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSendCommissionOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSendCommission}>
              <Send className="h-4 w-4 mr-2" />
              Confirm send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
