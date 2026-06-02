import { useState } from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/components/admin/AdminContext";
import { LedgerSection, Row, totalLedger } from "@/components/admin/shared";
import { type RestaurantCustomer } from "@/lib/adminApi";

export default function Customers() {
  const { customers } = useAdmin();
  const [viewCustomer, setViewCustomer] = useState<RestaurantCustomer | null>(null);

  return (
    <div className="space-y-4">
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">All customers</h3>
            <p className="text-sm text-muted-foreground">{customers.length} total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>TotalSales</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.businessName}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.businessName}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(c.joinedAt, "MMM d, yyyy")}</TableCell>
                  <TableCell>GHS {totalLedger(c.payout, false).toLocaleString()}</TableCell>
                  <TableCell>GHS {totalLedger(c.commission, false).toLocaleString()}</TableCell>
                  <TableCell>GHS {c.totalSales.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setViewCustomer(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!viewCustomer} onOpenChange={(o) => !o && setViewCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewCustomer?.businessName}</DialogTitle>
            <DialogDescription>Customer details</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-5 text-sm">
              <div className="space-y-2">
                <Row label="ID" value={viewCustomer._id} />
                <Row label="Business name" value={viewCustomer.businessName} />
                <Row label="Slug" value={viewCustomer.slug || "Not set"} />
                <Row label="Phone" value={viewCustomer.phone || "Not set"} />
                <Row label="Logo" value={viewCustomer.logo || "Not set"} />
                <Row label="Address" value={viewCustomer.address || "Not set"} />
                <Row label="Role" value={viewCustomer.role || "Not set"} />
                <Row label="Created" value={format(viewCustomer.joinedAt, "PPP")} />
                <Row label="Updated" value={format(new Date(viewCustomer.updatedAt), "PPP")} />
                <Row label="TotalSales" value={`GHS ${viewCustomer.totalSales.toLocaleString()}`} />
                <Row label="Commission percent" value={`${viewCustomer.commissionPercent}%`} />
                <Row label="Pending Payout" value={`GHS ${totalLedger(viewCustomer.payout, false).toLocaleString()}`} />
              </div>

              <LedgerSection title="Pending Payouts" items={viewCustomer.payout.filter((i) => !i.paid)} />
              <LedgerSection title="Completed Payouts" items={viewCustomer.payout.filter((i) => i.paid)} />
              <LedgerSection title="Unpaid Commission" items={viewCustomer.commission.filter((i) => !i.paid)} />
              <LedgerSection title="Paid Commission" items={viewCustomer.commission.filter((i) => i.paid)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
