import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, Stethoscope, MoreHorizontal } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { getTpas } from "@/lib/api/masters.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/masters/tpa")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "TPA Master — SecureSuite" }] }),
  component: TpaMasterPage,
});

function TpaMasterPage() {
  const queryClient = useQueryClient();
  const { data: tpas, isLoading } = useQuery({ queryKey: ["tpas"], queryFn: () => getTpas() });
  const list = tpas ?? [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    queryClient.setQueryData(["tpas"], (old: string[] = []) => [...old, newItem.trim()]);
    toast.success("TPA added successfully", { description: "Note: TPAs are derived from policies in the database." });
    setNewItem("");
    setIsAddOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="TPA Master"
        subtitle="Manage Third Party Administrators for Health policies"
        actions={<PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add TPA</PrimaryButton>}
      />

      <div className="surface-card overflow-hidden mt-4 max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">TPA Name</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : list.map((t, i) => (
                <tr key={i} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
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
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">No TPAs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add TPA</DialogTitle>
            <DialogDescription>
              Enter the name of the new TPA.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">TPA Name</Label>
              <Input 
                id="itemName" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)} 
                placeholder="e.g., MediAssist" 
                autoFocus
              />
            </div>
            <DialogFooter className="mt-6">
              <PrimaryButton onClick={() => {}}>Save TPA</PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
