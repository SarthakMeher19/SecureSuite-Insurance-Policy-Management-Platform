import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { createEndorsement } from "@/lib/api/policies.server";
import { toast } from "sonner";

export function EndorsementForm({ open, onOpenChange, policyId }: { open: boolean; onOpenChange: (open: boolean) => void; policyId: string }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    endorsementNo: "",
    endorseDate: new Date().toISOString().split("T")[0],
    endorseDetail: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEndorsement({
        data: {
          policyId,
          ...formData
        }
      });
      
      toast.success("Endorsement recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to record endorsement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Endorsement</DialogTitle>
          <DialogDescription>Modify an active policy mid-term.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endorsementNo">Endorsement Number</Label>
            <Input id="endorsementNo" required placeholder="END-12345" value={formData.endorsementNo} onChange={e => setFormData({ ...formData, endorsementNo: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Endorsement Date</Label>
            <Input id="date" type="date" required value={formData.endorseDate} onChange={e => setFormData({ ...formData, endorseDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail">Details of Changes</Label>
            <Input id="detail" required placeholder="e.g. Changed address, added rider..." value={formData.endorseDetail} onChange={e => setFormData({ ...formData, endorseDetail: e.target.value })} />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Record Endorsement"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
