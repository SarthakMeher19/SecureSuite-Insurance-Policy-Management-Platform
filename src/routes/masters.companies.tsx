import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, Building2, MoreHorizontal } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { getCompanies } from "@/lib/api/masters.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/masters/companies")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Insurance Companies — SecureSuite" }] }),
  component: CompaniesMasterPage,
});

function CompaniesMasterPage() {
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useQuery({ queryKey: ["companies"], queryFn: () => getCompanies() });
  const list = companies ?? [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    queryClient.setQueryData(["companies"], (old: string[] = []) => [...old, newItem.trim()]);
    toast.success("Company added successfully", { description: "Note: Companies are derived from policies in the database." });
    setNewItem("");
    setIsAddOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Insurance Companies"
        subtitle="Manage the list of insurance providers"
        actions={<PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add Company</PrimaryButton>}
      />

      <div className="surface-card overflow-hidden mt-4 max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Company Name</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : list.map((c, i) => (
                <tr key={i} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-sm text-muted-foreground">No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <DialogDescription>
              Enter the name of the new insurance company.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Company Name</Label>
              <Input 
                id="itemName" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)} 
                placeholder="e.g., HDFC Ergo" 
                autoFocus
              />
            </div>
            <DialogFooter className="mt-6">
              <PrimaryButton onClick={() => {}}>Save Company</PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
