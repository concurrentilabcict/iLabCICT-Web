import DesktopLayout from "@/layouts/Technician/ManageTicket/DesktopLayout";
import MobileLayout from "@/layouts/Technician/ManageTicket/MobileLayout";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ManageTicketPage() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            {isMobile ? <MobileLayout /> : <DesktopLayout />}
        </>
    );
}