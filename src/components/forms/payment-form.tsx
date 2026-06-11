import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createPayment } from "@/lib/api/payments.server";
import { getPolicies } from "@/lib/api/policies.server";
import { toast } from "sonner";

export function PaymentForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });

  const [formData, setFormData] = useState({
    policyId: "",
    amount: "",
    payDate: "",
    paymentType: "Online",
    chequeNo: "",
    bankName: "",
    note: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const policy = policies.find(p => p.id === formData.policyId || p.dbId === formData.policyId);
      if (!policy) throw new Error("Please select a valid policy");

      await createPayment({
        data: {
          policyId: policy.dbId || policy.id,
          amount: formData.amount,
          payDate: formData.payDate,
          paymentType: formData.paymentType,
          chequeNo: formData.chequeNo,
          bankName: formData.bankName,
          note: formData.note,
        }
      });
      
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Log a new payment receipt.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="policy">Policy Number</Label>
            <Select required value={formData.policyId} onValueChange={v => setFormData({ ...formData, policyId: v })}>
              <SelectTrigger id="policy"><SelectValue placeholder="Select Policy" /></SelectTrigger>
              <SelectContent>
                {policies.map(p => <SelectItem key={p.id} value={p.id}>{p.policyNumber} ({p.customerName})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Payment Method</Label>
            <Select value={formData.paymentType} onValueChange={v => setFormData({ ...formData, paymentType: v })}>
              <SelectTrigger id="type"><SelectValue placeholder="Select Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online / UPI / NEFT</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.paymentType === "Cheque" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cheque No.</Label>
                <Input placeholder="000123" value={formData.chequeNo} onChange={e => setFormData({ ...formData, chequeNo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input placeholder="HDFC Bank" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" required placeholder="15000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input id="date" type="date" required value={formData.payDate} onChange={e => setFormData({ ...formData, payDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Optional notes..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Record Payment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
