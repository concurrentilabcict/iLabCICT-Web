import RepairLogCard from "./RepairLogCard";


export default function RepairLog() {
    return(
        <>
            <div className="flex items-center justify-center p-3 gap-3">
                <RepairLogCard />
                <RepairLogCard />
            
            </div>
        </>
    );
}