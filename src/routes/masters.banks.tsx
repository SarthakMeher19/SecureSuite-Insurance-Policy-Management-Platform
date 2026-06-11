import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, Building2, MoreHorizontal } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { getBanks } from "@/lib/api/masters.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/masters/banks")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Bank Master — SecureSuite" }] }),
  component: BanksMasterPage,
});

function BanksMasterPage() {
  const queryClient = useQueryClient();
  const { data: banks, isLoading } = useQuery({ queryKey: ["banks"], queryFn: () => getBanks() });
  const list = banks ?? [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBank, setNewBank] = useState("");

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.trim()) return;
    
    // Since banks are derived from payments in the database, 
    // we simulate adding it by manually updating the React Query cache.
    queryClient.setQueryData(["banks"], (old: string[] = []) => [...old, newBank.trim()]);
    toast.success("Bank added successfully", { description: "Note: Banks are derived from payments in the database." });
    setNewBank("");
    setIsAddOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Bank Master"
        subtitle="Manage list of banks for payments"
        actions={<PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add Bank</PrimaryButton>}
      />

      <div className="surface-card overflow-hidden mt-4 max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Bank Name</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : list.map((b, i) => (
                <tr key={i} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {b}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">No banks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Bank</DialogTitle>
            <DialogDescription>
              Enter the name of the new bank.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBank} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input 
                id="bankName" 
                value={newBank} 
                onChange={(e) => setNewBank(e.target.value)} 
                placeholder="e.g., State Bank of India" 
                autoFocus
              />
            </div>
            <DialogFooter className="mt-6">
              <PrimaryButton onClick={() => {}}>Save Bank</PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
