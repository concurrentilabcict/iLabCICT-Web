import NotificationCard from "./NotificationCard";


export default function Notification() {
    return(
        <>
            <div className="flex flex-col py-3 gap-y-3">
                <NotificationCard />
                <NotificationCard />
                <NotificationCard />
            </div>
        </>
    );
}