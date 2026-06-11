import { useForm } from "react-hook-form";
import { X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createQuotation } from "@/lib/api/quotations.server";

interface QuotationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationForm({ open, onOpenChange }: QuotationFormProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      customerName: "",
      customerId: "0",
      mobile: "",
      insurer: "",
      type: "Motor",
      productName: "Comprehensive",
      basic: 0,
      tpMotor: 0,
      gst: 0,
      total: 0,
    }
  });

  const basic = watch("basic");
  const tpMotor = watch("tpMotor");
  const gst = watch("gst");

  const mutation = useMutation({
    mutationFn: (data: any) => createQuotation({ data }),
    onSuccess: () => {
      toast.success("Quotation created successfully");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create quotation");
    }
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle>Create Quotation</DialogTitle>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="quotation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Customer Details</h3>
              
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input {...register("customerName", { required: "Customer Name is required" })} placeholder="Enter customer name" />
                {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input {...register("mobile")} placeholder="Enter mobile number" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Policy Details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Policy Type</Label>
                  <Select onValueChange={(v) => setValue("type", v)} defaultValue="Motor">
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motor">Motor</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Marine">Marine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Insurer Name</Label>
                  <Select onValueChange={(v) => setValue("insurer", v)}>
                    <SelectTrigger><SelectValue placeholder="Select insurer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                      <SelectItem value="HDFC ERGO">HDFC ERGO</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                      <SelectItem value="Star Health">Star Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input {...register("productName")} placeholder="e.g. Comprehensive Motor" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Premium Details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Basic Premium</Label>
                  <Input type="number" {...register("basic", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>TP Premium (Motor)</Label>
                  <Input type="number" {...register("tpMotor", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>GST</Label>
                  <Input type="number" {...register("gst", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Total Premium</Label>
                  <Input 
                    type="number" 
                    {...register("total", { valueAsNumber: true })} 
                    defaultValue={Number(basic || 0) + Number(tpMotor || 0) + Number(gst || 0)} 
                  />
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="border-t border-border bg-surface-elevated px-6 py-4">
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" form="quotation-form" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Quotation"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
