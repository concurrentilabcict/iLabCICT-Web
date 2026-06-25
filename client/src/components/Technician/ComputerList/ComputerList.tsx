import { useMediaQuery } from "@/hooks/useMediaQuery";
import ComputerCard from "./ComputerCard";

export default function ComputerList(){

    const isMobile = useMediaQuery("(max-width: 767px)")

    return(
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-1
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
                <ComputerCard/>
            </div>
        </>
        );
}