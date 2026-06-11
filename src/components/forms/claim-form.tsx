import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createClaim } from "@/lib/api/claims.server";
import { getPolicies } from "@/lib/api/policies.server";
import { getCustomers } from "@/lib/api/customers.server";
import { toast } from "sonner";

export function ClaimForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => getCustomers() });

  const [formData, setFormData] = useState({
    customerId: "",
    policyId: "",
    estimatedLoss: "",
    dateOfLoss: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customer = customers.find(c => c.id === formData.customerId || c.dbId === formData.customerId);
      const policy = policies.find(p => p.id === formData.policyId || p.dbId === formData.policyId);
      
      if (!customer || !policy) throw new Error("Please select a valid customer and policy");

      await createClaim({
        data: {
          customerId: customer.dbId || customer.id,
          policyId: policy.dbId || policy.id,
          estimatedLoss: formData.estimatedLoss,
          dateOfLoss: formData.dateOfLoss,
          dateOfIntimation: new Date().toISOString(),
          status: "Under Review"
        }
      });
      
      toast.success("Claim registered successfully");
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to register claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Claim</DialogTitle>
          <DialogDescription>Record a new insurance claim.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select required value={formData.customerId} onValueChange={v => setFormData({ ...formData, customerId: v })}>
              <SelectTrigger id="customer"><SelectValue placeholder="Select Customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
            <Label htmlFor="amount">Estimated Loss (₹)</Label>
            <Input id="amount" type="number" required placeholder="50000" value={formData.estimatedLoss} onChange={e => setFormData({ ...formData, estimatedLoss: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date of Incident</Label>
            <Input id="date" type="date" required value={formData.dateOfLoss} onChange={e => setFormData({ ...formData, dateOfLoss: e.target.value })} />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Register Claim"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
