import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    buildApiUrl,
    createApiError,
    privateFetch,
    type ApiError
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/utils/appToast";
import DropDownOptions from "./DropDownOptions";
import type { Room, RoomForm, BuildingNames, RoomStatus, FloorNumber } from "@/types/room";
import type { EditRoomFormType } from "@/types/room";

type AddRoomProps = { 
    closeSheet: () => void;
    room: EditRoomFormType,
}

type Custodian = {
    id: number,
    firstName: string,
    lastName:string
}

type ApiAvailableUser = {
    id: number,
    first_name: string,
    last_name: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const getResponseMessage = (value: unknown) => {
    if (!isRecord(value)) {
        return undefined;
    }

    return typeof value.message === "string"
        ? value.message
        : typeof value.detail === "string"
            ? value.detail
            : undefined;
};

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



export default function EditRoomForm({
    closeSheet,
    room
}: AddRoomProps){

    const mapAvailableUser = (user: ApiAvailableUser): Custodian => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name
    })

    const {data: custodians = [], isLoading } = useQuery<Custodian[]>({
        queryKey: ["custodian"],
        queryFn: async ()=>{
            
             const res = await privateFetch(room.assignedCustodianId ? 
                buildApiUrl(`/api/users/available-custodian/?include=${room.assignedCustodianId}`)
                :
                buildApiUrl("/api/users/available-custodian/")
            );

             const data = await res.json();

             if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch users.');
            }
            return (data as ApiAvailableUser[]).map(mapAvailableUser);
        }
    })

    const {
        data: technicians = [],
        isLoading: techniciansAreLoading
    } = useQuery<Custodian[]>({
        queryKey: ["available-technician", room.assignedTechnicianId],
        queryFn: async () => {
            const res = await privateFetch(room.assignedTechnicianId ?
                buildApiUrl(`/api/users/available-technician/?include=${room.assignedTechnicianId}`)
                :
                buildApiUrl("/api/users/available-technician/")
            );
            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to fetch technicians.");
            }

            return (data as ApiAvailableUser[]).map(mapAvailableUser);
        }
    })

    const custodianOptions = [
    {
        label: "No custodian",
        value: null,
    },
    ...custodians.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
    })),
    ];

    const roomTechnicianOptions = [
    {
        label: "No technician",
        value: null,
    },
    ...technicians.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
    })),
    ];

    const initialForm: EditRoomFormType = {
        id: room.id,
        roomName: room.roomName,
        floorNumber: room.floorNumber,
        buildingName: room.buildingName,
        roomStatus: room.roomStatus,
        assignedCustodianId:  room.assignedCustodianId || null,
        assignedTechnicianId: room.assignedTechnicianId || null
    }

    const [form, setForm] = useState<EditRoomFormType>(initialForm);
    const queryClient = useQueryClient();

    const editComputerMutation = useMutation({
        mutationFn: async () => {
            const response = await privateFetch(
                buildApiUrl(`/api/rooms/${room.id}/`),
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        room_name: form.roomName.trim(),
                        floor_number: form.floorNumber,
                        building_name: form.buildingName,
                        status: form.roomStatus,
                        assigned_custodian: form.assignedCustodianId,
                        assigned_technician: form.assignedTechnicianId
                    }),
                }
            );
            const data: unknown = await response.json();

            if(!response.ok){
                throw createApiError(
                    response.status,
                    getResponseMessage(data) || "Failed to edit room."
                );
            }

            if (!isRecord(data) || data.status !== form.roomStatus) {
                throw createApiError(
                    500,
                    "The room status was not saved by the server."
                );
            }

            return data;
        },
        onSuccess: () => {
            const assignedCustodian = custodians.find(
                (custodian) => custodian.id === form.assignedCustodianId
            );
            const assignedTechnician = technicians.find(
                (technician) => technician.id === form.assignedTechnicianId
            );

            queryClient.setQueryData<Room[]>(
                ["rooms"],
                (currentRooms = []) =>
                    currentRooms.map((currentRoom) =>
                        currentRoom.id === room.id
                            ? {
                                ...currentRoom,
                                roomName: form.roomName.trim(),
                                floorNumber: form.floorNumber,
                                buildingName: form.buildingName,
                                status: form.roomStatus,
                                assignedCustodian: assignedCustodian
                                    ? {
                                        id: assignedCustodian.id,
                                        firstName: assignedCustodian.firstName,
                                        lastName: assignedCustodian.lastName,
                                    }
                                    : null,
                                assignedTechnician: assignedTechnician
                                    ? {
                                        id: assignedTechnician.id,
                                        firstName: assignedTechnician.firstName,
                                        lastName: assignedTechnician.lastName,
                                    }
                                    : null,
                            }
                            : currentRoom
                    )
            );

            appToast.success("Room details updated successfully.");
            closeSheet();
        },
        onError: (error: ApiError) => {
            if(error.status === 400){
                appToast.warning("Please review the room details and try again.");
                return;
            }

            appToast.error("We couldn't update the room. Please try again.");
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
        editComputerMutation.mutate();
    }

    const isSame =
        JSON.stringify(form) === JSON.stringify(initialForm);
    const isSubmitting = editComputerMutation.isPending;
    const selectedRoomStatus =
        roomStatusOptions.find((status) => status.value === form.roomStatus) ?? roomStatusOptions[0];

    const selectedBuildingName =
        buildingNamesOptions.find((building) => building.value === form.buildingName) ?? buildingNamesOptions[0];

    const selectedFloorNumber = 
        floorNumberOptions.find((floor) => floor.value === form.floorNumber) ?? floorNumberOptions[0];
   
    const selectedCustodian = 
        custodianOptions.find((custodian) => custodian.value === form.assignedCustodianId) ?? null;

    const selectedRoomTechnician =
        roomTechnicianOptions.find((technician) => technician.value === form.assignedTechnicianId) ?? null;

    return(
        <form onSubmit={handleSubmit} className="flex flex-col h-full">   
            <SheetHeader>
                <SheetTitle className="text-lg font-semibold"> Update Room | {room.roomName}</SheetTitle>
                <SheetDescription>
                 Update a room record in the system.
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

                        {!techniciansAreLoading && (<div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Room Technician</h3>
                            <div className="w-38">
                                <DropDownOptions
                                    fieldLabel="technician"
                                    fieldType="assignedTechnicianId"
                                    selectedItem={selectedRoomTechnician}
                                    isSubmitting={isSubmitting}
                                    form={form}
                                    updateField={updateField}
                                    itemOptions={roomTechnicianOptions}
                                />
                            </div>
                        </div>)}

                        {techniciansAreLoading && (<div className="w-full flex items-center justify-between">
                            <h3 className="font-medium secondary-text-color">Room Technician</h3>
                            <div className="">
                                Loading...
                            </div>
                        </div>)}
                        
                        
                </div>
            </div>

            <SheetFooter className={``}>
                <Button type="submit" disabled={isSubmitting || isSame} className="hover:cursor-pointer">
                    {isSubmitting && <Spinner />}
                    Update room
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
