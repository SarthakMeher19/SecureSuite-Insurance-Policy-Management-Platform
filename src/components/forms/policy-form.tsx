import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createPolicy } from "@/lib/api/policies.server";
import { getCustomers } from "@/lib/api/customers.server";
import { getAgents } from "@/lib/api/agents.server";
import { getCompanies, getPolicyTypes } from "@/lib/api/masters.server";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function PolicyForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => getCustomers() });
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: () => getAgents() });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => getCompanies() });
  const { data: pTypes = [] } = useQuery({ queryKey: ["policyTypes"], queryFn: () => getPolicyTypes() });

  const [formData, setFormData] = useState({
    policyNumber: "",
    customerId: "",
    agentId: "direct",
    company: "",
    type: "",
    premium: "",
    sumInsured: "",
    startDate: "",
    expiryDate: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customer = customers.find(c => c.id === formData.customerId) || customers.find(c => c.dbId === formData.customerId);
      const cName = customer?.name || "Unknown";
      
      const payload = {
        policyNumber: formData.policyNumber,
        customerId: customer?.dbId || formData.customerId,
        customerName: cName,
        agentId: formData.agentId === "direct" ? undefined : formData.agentId,
        company: formData.company,
        type: formData.type,
        premium: Number(formData.premium),
        sumInsured: Number(formData.sumInsured),
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
      };

      await createPolicy({ data: payload });
      toast.success("Policy created successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Policy</DialogTitle>
          <DialogDescription>Create a new insurance policy. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input id="policyNumber" required placeholder="POL-123456789" value={formData.policyNumber} onChange={e => setFormData({ ...formData, policyNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select required value={formData.customerId} onValueChange={v => setFormData({ ...formData, customerId: v })}>
                <SelectTrigger id="customer"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.dbId || c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Policy Type</Label>
              <Select required value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                <SelectTrigger id="type"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {pTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Insurance Company</Label>
              <Select required value={formData.company} onValueChange={v => setFormData({ ...formData, company: v })}>
                <SelectTrigger id="company"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent">Agent / Broker</Label>
            <Select value={formData.agentId} onValueChange={v => setFormData({ ...formData, agentId: v })}>
              <SelectTrigger id="agent"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premium">Premium Amount (₹)</Label>
              <Input id="premium" type="number" required placeholder="15000" value={formData.premium} onChange={e => setFormData({ ...formData, premium: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sum">Sum Insured (₹)</Label>
              <Input id="sum" type="number" required placeholder="500000" value={formData.sumInsured} onChange={e => setFormData({ ...formData, sumInsured: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input id="start" type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Expiry Date</Label>
              <Input id="end" type="date" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
