import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Car, Heart, Shield, Activity, CreditCard, Flame, Plane, Home, FileEdit } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { StatusBadge } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getPolicyById, renewPolicy } from "@/lib/api/policies.server";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PaymentForm } from "@/components/forms/payment-form";
import { EndorsementForm } from "@/components/forms/endorsement-form";

const TYPE_ICON: Record<string, any> = {
  Health: Heart,
  Vehicle: Car,
  Life: Shield,
  Travel: Plane,
  Property: Home,
};

export const Route = createFileRoute("/policies/$id")({
  component: PolicyDetailPage,
});

function PolicyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [endorsementOpen, setEndorsementOpen] = useState(false);

  const renewMutation = useMutation({
    mutationFn: (id: string) => renewPolicy({ data: id }),
    onSuccess: (newId) => {
      toast.success("Policy renewed successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy"] });
      navigate({ to: `/policies/$id`, params: { id: newId } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to renew policy");
    }
  });

  const { data: p, isLoading, error } = useQuery({ 
    queryKey: ["policy", id], 
    queryFn: () => getPolicyById({ data: id }) 
  });

  if (isLoading) return <PageContainer><div className="py-12 text-center text-muted-foreground">Loading policy...</div></PageContainer>;
  if (error || !p) return <PageContainer><div className="py-12 text-center text-accent-rose">Error loading policy</div></PageContainer>;

  const Icon = TYPE_ICON[p.type] || Shield;

  return (
    <PageContainer>
      <div className="mb-6">
        <Link to="/policies" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Policies
        </Link>
      </div>

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{p.policyNumber}</span>
            <StatusBadge status={p.status} />
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2">
            <span>{p.type} Insurance • {p.company}</span>
            {p.renewFromNumber && (
              <>
                <span>•</span>
                <Link to="/policies/$id" params={{ id: `P-${p.renewId}` }} className="text-primary hover:underline">
                  Renewed from {p.renewFromNumber}
                </Link>
              </>
            )}
          </div>
        }
        actions={
          <>
            <SecondaryButton 
              icon={Activity} 
              onClick={() => renewMutation.mutate(p.dbId)}
            >
              {renewMutation.isPending ? "Renewing..." : "Renew Policy"}
            </SecondaryButton>
            <SecondaryButton icon={FileEdit} onClick={() => setEndorsementOpen(true)}>Record Endorsement</SecondaryButton>
            <PrimaryButton icon={CreditCard} onClick={() => setPaymentOpen(true)}>Record Payment</PrimaryButton>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Main Info */}
          <div className="surface-card p-6">
            <h3 className="text-base font-semibold">Policy Overview</h3>
            <div className="mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Premium</div>
                <div className="mt-1 font-semibold">{formatINR(p.premium)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Sum Insured</div>
                <div className="mt-1 font-semibold">{formatINR(p.sumInsured)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Start Date</div>
                <div className="mt-1 font-semibold">{new Date(p.startDate).toLocaleDateString("en-IN")}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Expiry Date</div>
                <div className="mt-1 font-semibold">{new Date(p.expiryDate).toLocaleDateString("en-IN")}</div>
              </div>
            </div>
          </div>

          {/* Endorsements Section */}
          {(p.endorsementNo || p.endorseDate || p.endorseDetail) && (
            <div className="surface-card p-6">
              <h3 className="text-base font-semibold">Endorsement Details</h3>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Endorsement No</div>
                  <div className="mt-1 font-medium">{p.endorsementNo || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Endorsement Date</div>
                  <div className="mt-1 font-medium">{p.endorseDate || "—"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Details</div>
                  <div className="mt-1 font-medium">{p.endorseDetail || "—"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Specific Details depending on type */}
          {p.details.motor && (
            <div className="surface-card p-6">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-accent-blue" />
                <h3 className="text-base font-semibold">Vehicle Details</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div><span className="text-muted-foreground">Reg No:</span> <br/>{p.details.motor.vehicleNo}</div>
                <div><span className="text-muted-foreground">Engine:</span> <br/>{p.details.motor.engineNo}</div>
                <div><span className="text-muted-foreground">Chassis:</span> <br/>{p.details.motor.chassisNo}</div>
                <div><span className="text-muted-foreground">Make/Model:</span> <br/>{p.details.motor.makeModel}</div>
              </div>
            </div>
          )}

          {p.details.fire && (
            <div className="surface-card p-6">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-accent-orange" />
                <h3 className="text-base font-semibold">Property Details</h3>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Risk Location:</span> <br/>{p.details.fire.riskLocation}
              </div>
            </div>
          )}

          {p.details.health && p.details.health.length > 0 && (
            <div className="surface-card p-6">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-accent-rose" />
                <h3 className="text-base font-semibold">Insured Members</h3>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs text-muted-foreground">
                    <tr><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Relation</th><th className="pb-2 font-medium">DOB</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {p.details.health.map((h, i) => (
                      <tr key={i}>
                        <td className="py-2">{h.member}</td>
                        <td className="py-2">{h.relation}</td>
                        <td className="py-2">{h.dob ? new Date(h.dob).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments & Claims */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="surface-card p-6">
              <h3 className="text-base font-semibold">Payment History</h3>
              <div className="mt-4 space-y-3">
                {p.payments.map((pay) => (
                  <div key={pay.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{formatINR(pay.amount)}</div>
                      <div className="text-xs text-muted-foreground">{pay.type}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(pay.date).toLocaleDateString()}</div>
                  </div>
                ))}
                {p.payments.length === 0 && <div className="text-sm text-muted-foreground">No payments recorded.</div>}
              </div>
            </div>

            <div className="surface-card p-6">
              <h3 className="text-base font-semibold">Claims</h3>
              <div className="mt-4 space-y-3">
                {p.claims.map((c) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{c.claimNo}</div>
                      <div className="text-xs text-muted-foreground">{c.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatINR(c.amount)}</div>
                      <div className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : ""}</div>
                    </div>
                  </div>
                ))}
                {p.claims.length === 0 && <div className="text-sm text-muted-foreground">No claims filed.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="surface-card p-6">
            <h3 className="text-base font-semibold">Stakeholders</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Customer</div>
                <div className="mt-1 font-medium">{p.customer}</div>
                <Link to="/customers" className="text-xs text-accent-blue hover:underline">View Profile →</Link>
              </div>
              <div className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">Agent</div>
                <div className="mt-1 font-medium">{p.agent}</div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">Insurer</div>
                <div className="mt-1 font-medium">{p.company}</div>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-accent-violet" />
              <h3 className="text-base font-semibold">Activity Timeline</h3>
            </div>
            <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-border pl-6">
              {p.timeline.map((t) => (
                <div key={t.id} className="relative text-sm">
                  <span className="absolute -left-[1.6rem] top-1 h-2 w-2 rounded-full bg-accent-violet ring-4 ring-surface" />
                  <div className="font-medium">{t.description}</div>
                  <div className="text-xs text-muted-foreground">{t.date ? new Date(t.date).toLocaleDateString() : ""}</div>
                </div>
              ))}
              {p.timeline.length === 0 && (
                <div className="text-sm text-muted-foreground relative">
                  <span className="absolute -left-[1.6rem] top-1 h-2 w-2 rounded-full bg-border ring-4 ring-surface" />
                  Policy created
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PaymentForm open={paymentOpen} onOpenChange={setPaymentOpen} />
      <EndorsementForm open={endorsementOpen} onOpenChange={setEndorsementOpen} policyId={id} />
    </PageContainer>
  );
}
