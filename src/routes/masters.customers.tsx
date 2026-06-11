import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, Plus, FileDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { getCustomers, deleteCustomer } from "@/lib/api/customers.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CustomerForm } from "@/components/forms/customer-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/masters/customers")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Customer Master — SecureSuite" }] }),
  component: CustomerMasterPage,
});

function CustomerMasterPage() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({ queryKey: ["customers"], queryFn: () => getCustomers() });
  const list = customers ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const rawId = id.startsWith("C-") ? id.replace("C-", "") : id;
    if (confirm("Are you sure you want to delete this customer? All their policies and claims will also be deleted.")) {
      try {
        await deleteCustomer({ data: { id: rawId } });
        toast.success("Customer deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      } catch (err: any) {
        toast.error(err.message || "Failed to delete customer");
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customer Master"
        subtitle="Manage customer records and details"
        actions={
          <>
            <SecondaryButton icon={FileDown}>Export</SecondaryButton>
            <PrimaryButton icon={Plus} onClick={handleAdd}>Add Customer</PrimaryButton>
          </>
        }
      />

      <div className="surface-card overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Customer Name</th>
                <th className="px-5 py-3 text-left font-semibold">Contact Info</th>
                <th className="px-5 py-3 text-left font-semibold">City</th>
                <th className="px-5 py-3 text-left font-semibold">Assigned Agent</th>
                <th className="px-5 py-3 text-right font-semibold">Total Policies</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading customers...</td></tr>
              ) : list.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium">{c.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <div>{c.email || "—"}</div>
                    <div className="text-xs">{c.phone || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.city || "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.agent}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{c.policies}</td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(c)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-accent-rose focus:text-accent-rose focus:bg-accent-rose/10">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <CustomerForm open={isFormOpen} onOpenChange={setIsFormOpen} customer={selectedCustomer} />
    </PageContainer>
  );
}
