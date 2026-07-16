import type { ComputerCardType } from "@/types/computer";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Minus} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import PheripheralStatus from "./PheripheralStatus";
import ComputerStatus from "./ComputerStatus";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type EditComputerProps = {
    closeSheet: () => void;
    computer: ComputerCardType; 
}

type PeripheralStatus = "active" | "fixing" | "broken" | "none";

type ComputerStatusType = "active" | "fixing" | "broken";

type EditComputerForm = {
    id: number | null
    cpu: string,
    gpu: string,
    motherboard: string,
    ramSize: number,
    diskSize: number,
    operatingSystem: string,
    buildVersion: string,
    computerStatus: ComputerStatusType,
    monitorStatus: PeripheralStatus,
    mouseStatus: PeripheralStatus,
    keyboardStatus: PeripheralStatus,
    upsStatus: PeripheralStatus,
    room: number | null
}

const peripheralStatusOptions: Array<{
    label: string,
    value: PeripheralStatus
}> = [
    {
    label: "Active",
    value: "active",
  },
  {
    label: "Fixing",
    value: "fixing",
  },{
    label: "Broken",
    value: "broken",
  },
  {
    label: "None",
    value: "none",
  },
];

const computerStatusOptions: Array<{
    label: string,
    value: ComputerStatusType
}> = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Fixing",
    value: "fixing",
  },{
    label: "Broken",
    value: "broken",
  },
];


export default function EditComputerForm({
closeSheet, 
computer
}:EditComputerProps){

    const initialForm: EditComputerForm = {
            id: computer.id,
            cpu: computer.cpu,
            gpu: computer.gpu,
            motherboard: computer.motherboard,
            ramSize: computer.ramSizeInstalled,
            diskSize: computer.diskSizeInstalled,
            operatingSystem: computer.operatingSystem,
            buildVersion: computer.buildVersion,
            computerStatus: computer.computerStatus as ComputerStatusType,
            monitorStatus: computer.monitorStatus as PeripheralStatus,
            mouseStatus: computer.mouseStatus as PeripheralStatus,
            keyboardStatus: computer.keyboardStatus as PeripheralStatus,
            upsStatus: computer.upsStatus as PeripheralStatus ,
            room: computer.room 
        }

    const [form, setForm] = useState<EditComputerForm>(initialForm);
    const queryClient = useQueryClient();

    const isSame =
        JSON.stringify(form) === JSON.stringify(initialForm);

    const editComputerMutation = useMutation({
        mutationFn: async() => {
            const response = await privateFetch(
                `https://ilabcict-backend.onrender.com/api/computers/${form.id}/`,
                {
                    method: "PATCH",
                    body:JSON.stringify({
                        cpu: form.cpu.trim(), 
                        gpu: form.gpu.trim(),
                        motherboard: form.motherboard.trim(),
                        ram_size_installed: form.ramSize,
                        disk_size_installed: form.diskSize,
                        operating_system: form.operatingSystem,
                        build_version: form.buildVersion,
                        computer_status: form.computerStatus,
                        monitor_status: form.monitorStatus,
                        mouse_status: form.mouseStatus,
                        keyboard_status: form.keyboardStatus,
                        ups_status: form.upsStatus,
                    }),
                }
            );

            const data = await response.json();

            if(!response.ok){
                throw createApiError(
                    response.status, 
                     data.message || data.detail || "Failed to update computer."
                );
            }

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["technician-computers"]
            });

            toast.success("Computer updated successfully.");
            closeSheet();
        },
        onError: (error: ApiError) => {
            if(error.status === 400){
                toast.error(error.message || "Please check computer details.");
                return;
            }

            toast.error("Faild to updated computer.");
        }
    })

    const updateField = <Field extends keyof EditComputerForm>(
    field: Field,
    value: EditComputerForm[Field]
    ) => {
        setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        editComputerMutation.mutate();
    }

    const isSubmitting = editComputerMutation.isPending;
    const selectedMonitorStatus =
        peripheralStatusOptions.find((status) => status.value === form.monitorStatus) ?? peripheralStatusOptions[0];

    const selectedKeyboardStatus =
        peripheralStatusOptions.find((status) => status.value === form.keyboardStatus) ?? peripheralStatusOptions[0];

    const selectedUPSStatus =
        peripheralStatusOptions.find((status) => status.value === form.upsStatus) ?? peripheralStatusOptions[0];

    const selectedMouseStatus =
        peripheralStatusOptions.find((status) => status.value === form.mouseStatus) ?? peripheralStatusOptions[0];

    const selectedComputerStatus = 
        computerStatusOptions.find((status) => status.value === form.computerStatus) ?? computerStatusOptions[0];


    return(
        <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full"
        >
            <SheetHeader>
                <SheetTitle className="text-lg font-semibold"> Edit Computer |  {computer.computerCode}</SheetTitle>
                <SheetDescription>
                    Update a computer record in the system.
                </SheetDescription>
            </SheetHeader>

             <div className="flex flex-1 flex-col gap-2 px-4 overflow-y-scroll ">
            
                            <h1 className="font-medium text-md">Computer Specifications</h1>
                                <div className="flex flex-col gap-2">
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">CPU</h3>
                                        <Input
                                        value={form.cpu}
                                        onChange={(event) => updateField("cpu", event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">Motherboard</h3>
                                        <Input
                                        value={form.motherboard}
                                        onChange={(event) => updateField("motherboard", event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">GPU</h3>
                                        <Input
                                        value={form.gpu}
                                        onChange={(event) => updateField("gpu", event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">Total Ram Size Installed (GB)</h3>
                                        <Input
                                        type="number"
                                        value={form.ramSize}
                                        onChange={(event) => updateField("ramSize", Number(event.target.value))}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">Disk Size Installed (GB)</h3>
                                        <Input
                                        type="number"
                                        value={form.diskSize}
                                        onChange={(event) => updateField("diskSize", Number(event.target.value))}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">Operating System</h3>
                                        <Input
                                        value={form.operatingSystem}
                                        onChange={(event) => updateField("operatingSystem", event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
                                    <div className="flex flex-col gap-1">
            
                                        <h3 className="font-medium secondary-text-color">Build Version</h3>
                                        <Input
                                        value={form.buildVersion}
                                        onChange={(event) => updateField("buildVersion", event.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-10"
                                        />
                                    </div>
            
            
                                    <div className="w-full flex items-center justify-between">
                                    <h3 className="font-medium secondary-text-color">Computer Status</h3>
                                    <div className="w-28">
                                    <ComputerStatus
                                        selectedStatus={selectedComputerStatus}
                                        isSubmitting={isSubmitting}
                                        form={form}
                                        updateField={updateField}
                                        statusOptions={computerStatusOptions}
                                    />
                                    </div>
                                </div>
            
                            </div>
            
                            <div className="flex flex-col gap-4">
                                <h1 className="font-medium text-md">Peripheral Status</h1>
            
                                <div className="w-full flex items-center justify-between">
                                    <h3 className="font-medium secondary-text-color">Monitor</h3>
                                    <div className="w-28">
                                    <PheripheralStatus
                                        field={"monitorStatus"}
                                        selectedStatus={selectedMonitorStatus}
                                        isSubmitting={isSubmitting}
                                        form={form}
                                        updateField={updateField}
                                        statusOptions={peripheralStatusOptions}
                                    />
                                    </div>
                                </div>
            
                                <div className="w-full flex items-center justify-between">
                                    <h3 className="font-medium secondary-text-color">Keyboard</h3>
                                    <div className="w-28">
                                        <PheripheralStatus
                                        field={"keyboardStatus"}
                                        selectedStatus={selectedKeyboardStatus}
                                        isSubmitting={isSubmitting}
                                        form={form}
                                        updateField={updateField}
                                        statusOptions={peripheralStatusOptions}
                                    />
                                    </div>
                                    
                                </div>
            
                                <div className="w-full flex items-center justify-between">
                                    <h3 className="font-medium secondary-text-color">Mouse</h3>
                                    <div className="w-28">
                                        <PheripheralStatus
                                        field={"mouseStatus"}
                                        selectedStatus={selectedMouseStatus}
                                        isSubmitting={isSubmitting}
                                        form={form}
                                        updateField={updateField}
                                        statusOptions={peripheralStatusOptions}
                                        />
                                    </div>
                                    
                                </div>
            
                                <div className="w-full flex items-center justify-between">
                                    <h3 className="font-medium secondary-text-color">UPS</h3>
                                    <div className="w-28">
                                    <PheripheralStatus
                                        field={"upsStatus"}
                                        selectedStatus={selectedUPSStatus}
                                        isSubmitting={isSubmitting}
                                        form={form}
                                        updateField={updateField}
                                        statusOptions={peripheralStatusOptions}
                                    />
                                    </div>
                                    
                                </div>
            
                            </div>
            
                        </div>
            
                        <SheetFooter className={``}>
                            <Button type="submit" disabled={isSubmitting || isSame} className="hover:cursor-pointer">
                                {isSubmitting && <Spinner />}
                                Edit Computer
                            </Button>
            
                            <SheetClose asChild>
                            <Button type="button" disabled={isSubmitting} variant="outline"  className="hover:cursor-pointer">
                                Cancel
                            </Button>
                            </SheetClose>
                        </SheetFooter>

        </form>
    )

}