import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, FileDown, MoreHorizontal, FileText, CheckCircle2 } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { StatusBadge } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { QuotationForm } from "@/components/forms/quotation-form";
import { getQuotations, convertToPolicy } from "@/lib/api/quotations.server";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/quotations")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role === "customer") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Quotations — SecureSuite" }] }),
  component: QuotationsPage,
});

function QuotationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => getQuotations(),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => convertToPolicy({ data: id }),
    onSuccess: (newPolicyId) => {
      toast.success("Quotation successfully converted to a policy!");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      navigate({ to: `/policies/$id`, params: { id: `P-${newPolicyId}` } });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to convert quotation");
    }
  });

  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return quotations;
    const lower = searchTerm.toLowerCase();
    return quotations.filter(q => 
      q.customerName.toLowerCase().includes(lower) || 
      q.insurer.toLowerCase().includes(lower)
    );
  }, [quotations, searchTerm]);

  const kpis = {
    total: quotations.length,
    converted: quotations.filter(q => q.status === "Converted").length,
    pending: quotations.filter(q => q.status === "Pending").length,
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Quotations" 
        subtitle="Manage preliminary insurance quotations and convert them to policies."
        actions={
          <>
            <SecondaryButton icon={FileDown}>Export List</SecondaryButton>
            <PrimaryButton icon={Plus} onClick={() => setIsFormOpen(true)}>
              Create Quotation
            </PrimaryButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Total Quotes
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{kpis.total}</div>
        </div>
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Converted
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{kpis.converted}</div>
        </div>
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="h-4 w-4 text-amber-500" />
            Pending Review
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{kpis.pending}</div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers or insurers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Insurer / Type</th>
                <th className="px-6 py-4 font-medium">Premium</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading quotations...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-6 py-4 font-medium text-foreground">{quote.createdAt}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{quote.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{quote.insurer}</div>
                      <div className="text-xs text-muted-foreground">{quote.type}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{formatINR(quote.premium)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {quote.status === "Pending" ? (
                            <>
                              <DropdownMenuItem 
                                onClick={() => convertMutation.mutate(quote.id)}
                                className="text-emerald-500 font-medium cursor-pointer"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Convert to Policy
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Quotation</DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => navigate({ to: `/policies/$id`, params: { id: `P-${quote.policyId}` } })}>
                              View Linked Policy
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Delete Quotation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuotationForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </PageContainer>
  );
}
