import { useMediaQuery } from "@/hooks/useMediaQuery";
import AccountSecurity from "./AccountSecurity";
import ProfileForm from "./ProfileForm";
import AccountAction from "./AccountAction";


export default function Profile() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return(
        <>
            <div className={`flex flex-col py-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                <ProfileForm />
                <AccountSecurity />
                <AccountAction />
            </div>
        </>
    );
}