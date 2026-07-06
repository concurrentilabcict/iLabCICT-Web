import SummaryCard from "./SummaryCard";


export default function Dashboard() {
    return(
        <div className="grid grid-cols-4 gap-3">
            <SummaryCard /> 
            <SummaryCard />
            <SummaryCard />
            <SummaryCard />
        </div>
    );
}
