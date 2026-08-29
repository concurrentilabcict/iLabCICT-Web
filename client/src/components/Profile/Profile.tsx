import { useAuth } from "@/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AccountSecurity from "./AccountSecurity";
import FacultyProfile from "./FacultyProfile/FacultyProfile";
import ProfileForm from "./ProfileForm";
import ProfileTicketStats from "./ProfileTicketStats/ProfileTicketStats";

export default function Profile() {

    const isMobile = useMediaQuery("(max-width: 767px)");
    const { role } = useAuth();

    if (role.toLowerCase() === "faculty") {
        return(
            <>
                <div className={`flex flex-col gap-5 py-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                    <ProfileForm />
                    <FacultyProfile />
                    <AccountSecurity />
                </div>
            </>
        );
    }

    return(
        <>
            <div className={`flex flex-col gap-5 py-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                <ProfileForm />
                <ProfileTicketStats />
                <AccountSecurity />
            </div>
        </>
    );
}
