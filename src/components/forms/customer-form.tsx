import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createCustomer, updateCustomer } from "@/lib/api/customers.server";
import { getAgents } from "@/lib/api/agents.server";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/lib/role-context";

export function CustomerForm({ open, onOpenChange, customer }: { open: boolean; onOpenChange: (open: boolean) => void; customer?: any }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { role } = useRole();
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: () => getAgents() });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    agentId: "direct",
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        // Find the agent ID if available
        let agentId = "direct";
        if (customer.agent && customer.agent !== "Direct") {
          const agent = agents.find(a => a.name === customer.agent);
          if (agent) agentId = agent.id;
        }
        
        setFormData({
          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          city: customer.city || customer.address || "",
          agentId,
        });
      } else {
        // For agents, auto-select themselves
        const defaultAgentId = role === "agent" && agents.length > 0 ? agents[0].id : "direct";
        setFormData({ name: "", email: "", phone: "", city: "", agentId: defaultAgentId });
      }
    }
  }, [open, customer, agents, role]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.city,
        agentId: formData.agentId === "direct" ? undefined : formData.agentId,
      };

      if (customer) {
        const rawId = customer.id.startsWith("C-") ? customer.id.replace("C-", "") : customer.id;
        await updateCustomer({ data: { id: rawId, ...payload } });
        toast.success("Customer updated successfully");
      } else {
        await createCustomer({ data: payload });
        toast.success("Customer added successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "New Customer"}</DialogTitle>
          <DialogDescription>{customer ? "Update the customer's profile." : "Add a new customer to your database."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" required placeholder="Mumbai" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
          </div>
          {/* Agents auto-assign themselves, so hide the dropdown for them */}
          {role === "admin" && (
            <div className="space-y-2">
              <Label htmlFor="agent">Assigned Agent</Label>
              <Select value={formData.agentId} onValueChange={(val) => setFormData({ ...formData, agentId: val })}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct (No Agent)</SelectItem>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

