import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { createAgent, updateAgent } from "@/lib/api/agents.server";
import { toast } from "sonner";

export function AgentForm({ open, onOpenChange, agent }: { open: boolean; onOpenChange: (open: boolean) => void; agent?: any }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    rate: "",
  });

  useEffect(() => {
    if (open) {
      if (agent) {
        setFormData({
          name: agent.name || "",
          email: agent.email || "",
          phone: agent.phone || "",
          city: agent.city || "",
          rate: agent.brokerage_rate?.toString() || "",
        });
      } else {
        setFormData({ name: "", email: "", phone: "", city: "", rate: "" });
      }
    }
  }, [open, agent]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (agent) {
        await updateAgent({ data: { id: agent.id, name: formData.name, email: formData.email, phone: formData.phone, city: formData.city, rate: Number(formData.rate) } });
        toast.success("Agent updated successfully");
      } else {
        await createAgent({ data: { name: formData.name, email: formData.email, phone: formData.phone, city: formData.city, rate: Number(formData.rate) } });
        toast.success("Agent added successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["agents"] });
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
          <DialogTitle>{agent ? "Edit Agent" : "New Agent"}</DialogTitle>
          <DialogDescription>{agent ? "Update the agent's profile." : "Onboard a new agent or broker."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required placeholder="Rohan Mehta" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="rohan@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City / Address</Label>
            <Input id="city" required placeholder="Mumbai, MH" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Brokerage Rate (%)</Label>
            <Input id="rate" type="number" step="0.01" required placeholder="12" value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Agent"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
