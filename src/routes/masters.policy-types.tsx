import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, Shield, MoreHorizontal } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { getPolicyTypes } from "@/lib/api/masters.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/masters/policy-types")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Policy Types — SecureSuite" }] }),
  component: PolicyTypesMasterPage,
});

function PolicyTypesMasterPage() {
  const queryClient = useQueryClient();
  const { data: types, isLoading } = useQuery({ queryKey: ["policyTypes"], queryFn: () => getPolicyTypes() });
  const list = types ?? [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    queryClient.setQueryData(["policyTypes"], (old: string[] = []) => [...old, newItem.trim()]);
    toast.success("Policy Type added successfully", { description: "Note: Policy Types are derived from policies in the database." });
    setNewItem("");
    setIsAddOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Policy Types"
        subtitle="Manage available insurance product types"
        actions={<PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add Type</PrimaryButton>}
      />

      <div className="surface-card overflow-hidden mt-4 max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Policy Type</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : list.map((t, i) => (
                <tr key={i} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {t}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">No policy types found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Policy Type</DialogTitle>
            <DialogDescription>
              Enter the name of the new policy type.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Type Name</Label>
              <Input 
                id="itemName" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)} 
                placeholder="e.g., Marine Insurance" 
                autoFocus
              />
            </div>
            <DialogFooter className="mt-6">
              <PrimaryButton onClick={() => {}}>Save Type</PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
