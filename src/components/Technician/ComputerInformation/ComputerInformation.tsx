import { useMediaQuery } from "@/hooks/useMediaQuery";
import SystemDetailsCard from "./SystemDetailsCard";
import PeripheralDetailCard from "./PeripheralDetailCard";
import MaintenanceHistoryCard from "./MaintenanceHistoryCard";
export default function ComputerInformation(){

    const isMobile = useMediaQuery("(max-width: 767px)")

    const peripheralInformation = [
        {
            name: "Mouse",
            specifications: [
                {
                    type: "Brand",
                    value: "Logitech",
                },
                {
                    type: "Model",
                    value: "M100",
                },
                {
                    type: "Connection type",
                    value: "Wired USB",
                },
                {
                    type: "Status",
                    value: "Active",
                },
                
            ]
        },
        {
            name: "Keyboard",
            specifications: [
                {
                    type: "Brand",
                    value: "HP"
                },
                {
                    type: "Model",
                    value: "K1500"
                },
                {
                    type: "Switch Type",
                    value: "Membrane"
                },
                {
                    type: "Connection Type",
                    value: "Wired USB"
                },
                {
                    type: "Status",
                    value: "Active"
                },
            ]
        },
        {
            name: "Monitor",
            specifications: [
                {
                    type: "Brand",
                    value: "Samsung"
                },
                {
                    type: "Model",
                    value: "S24R350"
                },
                {
                    type: "Display Size",
                    value: "24 Inches"
                },
                {
                    type: "Resolution",
                    value: "1920x1080"
                },
                {
                    type: "Display Type",
                    value: "LED"
                },
                {
                    type: "Refresh Rate",
                    value: "60Hz"
                },
                {
                    type: "Status",
                    value: "Active"
                },
            ]
        },
        {
            name: "Uninterruptible Power Supply",
            specifications: [
                {
                    type: "Brand",
                    value: "APC"
                },
                {
                    type: "Model",
                    value: "BVX700LUI-MS"
                },
                {
                    type: "Capacity",
                    value: "700VA"
                },
                {
                    type: "Battery Type",
                    value: "Sealed Lead Acid"
                },
                {
                    type: "Status",
                    value: "Active"
                },
            ]
        }
    ];


    return(
        <>
        

        <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
        sm:grid sm:grid-cols-2 bg-red`}>
            
            <SystemDetailsCard/>
            <MaintenanceHistoryCard/>
            
        </div>

        <h1 className="my-3.5 text-md font-bold pl-3">Peripherals</h1>
            
        <div className={`flex w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
            {peripheralInformation.map((info, idx)=>(
                <PeripheralDetailCard
                    key={idx}
                    peripheralInformation={info.specifications}
                    name={info.name}/>
            ))}
        </div>
           
        </>
    );
}