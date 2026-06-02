import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/components/admin/AdminContext";
import { getLedgerKey, totalLedger } from "@/components/admin/shared";
import { type RestaurantCustomer } from "@/lib/adminApi";

export default function Payouts() {
  const { customers, setCustomers } = useAdmin();
  const [sendPayoutCustomer, setSendPayoutCustomer] = useState<RestaurantCustomer | null>(null);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);

  const handleSendPayouts = () => {
    if (!sendPayoutCustomer || selectedPayouts.length === 0) return;
    const selectedTotal = sendPayoutCustomer.payout
      .filter((i) => selectedPayouts.includes(getLedgerKey(i)))
      .reduce((s, i) => s + i.amount, 0);

    setCustomers((cs) =>
      cs.map((customer) =>
        customer._id === sendPayoutCustomer._id
          ? {
              ...customer,
              payout: customer.payout.map((i) =>
                selectedPayouts.includes(getLedgerKey(i)) ? { ...i, paid: true } : i
              ),
            }
          : customer
      )
    );
    toast.success(`Marked GHS ${selectedTotal.toLocaleString()} in payouts as paid`);
    setSendPayoutCustomer(null);
    setSelectedPayouts([]);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Payouts</h3>
          <p className="text-sm text-muted-foreground">
            Review unpaid payout entries and mark selected items as paid.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                <TableHead>Pending Payout</TableHead>
                <TableHead>Completed Payouts</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.businessName}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.businessName}</TableCell>
                  <TableCell className="font-semibold">GHS {totalLedger(c.payout, false).toLocaleString()}</TableCell>
                  <TableCell>GHS {totalLedger(c.payout, true).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={c.payout.filter((i) => !i.paid).length === 0}
                      onClick={() => {
                        const unpaid = c.payout.filter((i) => !i.paid);
                        setSendPayoutCustomer(c);
                        setSelectedPayouts(unpaid.map(getLedgerKey));
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" /> Confirm payouts
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog
        open={!!sendPayoutCustomer}
        onOpenChange={(o) => {
          if (!o) {
            setSendPayoutCustomer(null);
            setSelectedPayouts([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payouts</DialogTitle>
            <DialogDescription>
              Select the unpaid payout items to mark as paid for {sendPayoutCustomer?.businessName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {sendPayoutCustomer?.payout.filter((i) => !i.paid).map((item) => {
              const key = getLedgerKey(item);
              return (
                <label key={key} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPayouts.includes(key)}
                      onCheckedChange={(checked) => {
                        setSelectedPayouts((current) =>
                          checked ? [...current, key] : current.filter((s) => s !== key)
                        );
                      }}
                    />
                    <span>{item.date}</span>
                  </div>
                  <span className="font-semibold">GHS {item.amount.toLocaleString()}</span>
                </label>
              );
            })}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Selected total</span>
              <span>
                GHS {sendPayoutCustomer?.payout
                  .filter((i) => selectedPayouts.includes(getLedgerKey(i)))
                  .reduce((s, i) => s + i.amount, 0)
                  .toLocaleString() ?? "0"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendPayoutCustomer(null)}>Cancel</Button>
            <Button disabled={selectedPayouts.length === 0} onClick={handleSendPayouts}>
              <Send className="h-4 w-4 mr-2" /> Confirm selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
