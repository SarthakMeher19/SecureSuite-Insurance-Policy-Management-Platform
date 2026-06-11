import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck, FileWarning, Plus } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { StatusBadge } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getCustomerById } from "@/lib/api/customers.server";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/customers/$id")({
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const { data: c, isLoading, error } = useQuery({ 
    queryKey: ["customer", id], 
    queryFn: () => getCustomerById({ data: id }) 
  });

  if (isLoading) return <PageContainer><div className="py-12 text-center text-muted-foreground">Loading customer...</div></PageContainer>;
  if (error || !c) return <PageContainer><div className="py-12 text-center text-accent-rose">Error loading customer</div></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-6">
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
      </div>

      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10 text-lg font-semibold text-accent-blue">
              {c.name.split(" ").map((w) => w[0]).join("")}
            </div>
            <span>{c.name}</span>
          </div>
        }
        subtitle={`Customer since ${new Date(c.joinedAt).toLocaleDateString("en-IN")}`}
        actions={<PrimaryButton icon={Plus}>Add Policy</PrimaryButton>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="surface-card p-6">
            <h3 className="text-base font-semibold">Contact Info</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{c.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{c.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{c.address || "No address provided"}</span>
              </div>
            </div>
            
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-base font-semibold mb-4">Assigned Agent</h3>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-accent-violet" />
                <span className="font-medium">{c.agent}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Policies */}
          <div className="surface-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-green" />
                <h3 className="text-base font-semibold">Policies</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Policy No</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Premium</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {c.policies.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="py-3 font-medium">
                        <Link to={`/policies/${p.id}`} className="text-accent-blue hover:underline">{p.policyNumber}</Link>
                      </td>
                      <td className="py-3 text-muted-foreground">{p.type}</td>
                      <td className="py-3 text-right font-medium">{formatINR(p.premium)}</td>
                      <td className="py-3 text-center"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                  {c.policies.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No policies found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Claims */}
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileWarning className="h-4 w-4 text-accent-rose" />
              <h3 className="text-base font-semibold">Claim History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Claim No</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {c.claims.map((cl) => (
                    <tr key={cl.id}>
                      <td className="py-3 font-medium">{cl.claimNo}</td>
                      <td className="py-3 text-right font-medium">{formatINR(cl.amount)}</td>
                      <td className="py-3 text-center"><StatusBadge status={cl.status} /></td>
                    </tr>
                  ))}
                  {c.claims.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No claims filed</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
