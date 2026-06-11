import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, Plus, FileDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { getAgents, deleteAgent } from "@/lib/api/agents.server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AgentForm } from "@/components/forms/agent-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/masters/agents")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Agent Master — SecureSuite" }] }),
  component: AgentMasterPage,
});

function AgentMasterPage() {
  const queryClient = useQueryClient();
  const { data: agents, isLoading } = useQuery({ queryKey: ["agents"], queryFn: () => getAgents() });
  const list = agents ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const handleEdit = (agent: any) => {
    setSelectedAgent(agent);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedAgent(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      try {
        await deleteAgent({ data: { id } });
        toast.success("Agent deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      } catch (err: any) {
        toast.error(err.message || "Failed to delete agent");
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Agent Master"
        subtitle="Manage agent profiles and brokerage rates"
        actions={
          <>
            <SecondaryButton icon={FileDown}>Export</SecondaryButton>
            <PrimaryButton icon={Plus} onClick={handleAdd}>Add Agent</PrimaryButton>
          </>
        }
      />

      <div className="surface-card overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Agent Name</th>
                <th className="px-5 py-3 text-left font-semibold">Contact Info</th>
                <th className="px-5 py-3 text-left font-semibold">City</th>
                <th className="px-5 py-3 text-right font-semibold">Brokerage Rate</th>
                <th className="px-5 py-3 text-right font-semibold">Customers</th>
                <th className="px-5 py-3 text-right font-semibold">Policies</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading agents...</td></tr>
              ) : list.map((a) => (
                <tr key={a.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium">{a.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <div>{a.email || "—"}</div>
                    <div className="text-xs">{a.phone || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{a.city || "—"}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">{a.brokerage_rate}%</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{a.customerCount}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{a.policyCount}</td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(a)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(a.id)} className="text-accent-rose focus:text-accent-rose focus:bg-accent-rose/10">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">No agents found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AgentForm open={isFormOpen} onOpenChange={setIsFormOpen} agent={selectedAgent} />
    </PageContainer>
  );
}
