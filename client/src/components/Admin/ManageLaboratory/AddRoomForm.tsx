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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DropDownOptions from "./DropDownOptions";
import type { RoomForm, BuildingNames, RoomStatus, FloorNumber } from "@/types/room";

type AddRoomProps = { 
    closeSheet: () => void;
}





type Custodian = {
    id: number,
    firstName: string,
    lastName:string
}




const floorNumberOptions: Array<{
    label: string,
    value: FloorNumber
}> = [
    {
        label: "1st Floor",
        value: 1
    },
    {
        label: "2nd Floor",
        value: 2
    },
    {
        label: "3rd Floor",
        value: 3
    },
]

const buildingNamesOptions: Array<{
    label: string,
    value: BuildingNames
}> = [
    {
        label: "Pimentel",
        value: "pimentel"
    },
    {
        label: "Law",
        value: "law"
    },
    {
        label: "Acad",
        value: "acad"
    },

];

const roomStatusOptions: Array<{
    label: string,
    value: RoomStatus
}>=[
    {
        label: "Operational",
        value: "operational"
    },
    {
        label: "Maintenance",
        value: "maintenance"
    },
    {
        label: "Degraded",
        value: "degraded"
    },
    {
        label: "Out of Service",
        value: "out of service"
    },
];



export default function AddRoomForm({
    closeSheet,
}: AddRoomProps){
    
    

    const mapCustodian = (custodian: any): Custodian => ({
        id: custodian.id,
        firstName: custodian.first_name,
        lastName: custodian.last_name
    })


    const {data: custodians = [], isLoading } = useQuery<Custodian[]>({
        queryKey: ["custodian"],
        queryFn: async ()=>{
             const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/available-custodian/`);

             const data = await res.json();

             if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch users.');
            }
            return data.map(mapCustodian);
        }
    })

    const custodianOptions = custodians.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
    }));

    const initialForm: RoomForm = {
        roomName: "",
        floorNumber: 1,
        buildingName: "pimentel",
        roomStatus: "operational",
        assignedCustodianId:  null
    }

    const [form, setForm] = useState<RoomForm>(initialForm);
    const queryClient = useQueryClient();

    const addComputerMutation = useMutation({
        mutationFn: async () => {
            const response = await privateFetch(
                "https://ilabcict-backend.onrender.com/api/rooms/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        room_name: form.roomName.trim(),
                        floor_number: form.floorNumber,
                        building_name: form.buildingName,
                        room_status: form.roomStatus,
                        assigned_custodian: form.assignedCustodianId
                    }),
                }
            );
            const data = await response.json();

            if(!response.ok){
                throw createApiError(
                    response.status,
                    data.message || data.detail || "Failed to add room."
                );
            }

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["add-rooms"]
            });

            toast.success("room added successfully.");
            closeSheet();
        },
        onError: (error: ApiError) => {
            if(error.status === 400){
                toast.error(error.message || "Please check room details.");
                return;
            }

            toast.error("Faild to add room.");
        }
    });

    const updateField = <Field extends keyof RoomForm>(
    field: Field,
    value: RoomForm[Field]
    ) => {
        setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
        }));
    };


    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addComputerMutation.mutate();
    }

    const isSubmitting = addComputerMutation.isPending;
    const selectedRoomStatus =
        roomStatusOptions.find((status) => status.value === form.roomStatus) ?? roomStatusOptions[0];

    const selectedBuildingName =
        buildingNamesOptions.find((building) => building.value === form.buildingName) ?? buildingNamesOptions[0];

    const selectedFloorNumber = 
        floorNumberOptions.find((floor) => floor.value === form.floorNumber) ?? floorNumberOptions[0];
   
    const selectedCustodian = 
        custodianOptions.find((custodian) => custodian.value === form.assignedCustodianId) ?? null;

    return(
        <form onSubmit={handleSubmit} className="flex flex-col h-full">   
            <SheetHeader>
                <SheetTitle className="text-lg font-semibold"> Add Room </SheetTitle>
                <SheetDescription>
                Add a new room record to the system.
                </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-2 px-4 overflow-y-scroll ">

                <h1 className="font-medium text-md">Room Details</h1>
                    <div className="flex flex-col gap-2">

                        <div className="flex flex-col gap-1">

                            <h3 className="font-medium secondary-text-color">Room Name</h3>
                            <Input
                            value={form.roomName}
                            onChange={(event) => updateField("roomName", event.target.value)}
                            required
                            disabled={isSubmitting}
                            className="h-10"
                            />
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Building Name</h3>
                            <div className="w-38">
                                <DropDownOptions
                                    fieldLabel="building"
                                    fieldType="buildingName"
                                    selectedItem={selectedBuildingName}
                                    isSubmitting={isSubmitting}
                                    form={form}
                                    updateField={updateField}
                                    itemOptions={buildingNamesOptions}
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Floor Number</h3>
                            <div className="w-38">
                                <DropDownOptions
                                    fieldLabel="floor"
                                    fieldType="floorNumber"
                                    selectedItem={selectedFloorNumber}
                                    isSubmitting={isSubmitting}
                                    form={form}
                                    updateField={updateField}
                                    itemOptions={floorNumberOptions}
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Room Status</h3>
                            <div className="w-38">
                                <DropDownOptions
                                    fieldLabel="status"
                                    fieldType="roomStatus"
                                    selectedItem={selectedRoomStatus}
                                    isSubmitting={isSubmitting}
                                    form={form}
                                    updateField={updateField}
                                    itemOptions={roomStatusOptions}
                                />
                            </div>
                        </div>

                        {!isLoading && (<div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Room Custodian</h3>
                            <div className="w-38">
                                <DropDownOptions
                                    fieldLabel="custodian"
                                    fieldType="assignedCustodianId"
                                    selectedItem={selectedCustodian}
                                    isSubmitting={isSubmitting}
                                    form={form}
                                    updateField={updateField}
                                    itemOptions={custodianOptions}
                                />
                            </div>
                        </div>)}

                        {isLoading && (<div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Room Custodian</h3>
                            <div className="">
                                Loading...
                            </div>
                        </div>)}
                        
                        
                </div>
            </div>

            <SheetFooter className={``}>
                <Button type="submit" disabled={isSubmitting} className="hover:cursor-pointer">
                    {isSubmitting && <Spinner />}
                    Add room
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