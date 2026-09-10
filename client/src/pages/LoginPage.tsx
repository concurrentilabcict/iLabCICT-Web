import LoginForm from "@/components/LoginForm/LoginForm";
import "@/styles/system.css"
import Logo from "@/assets/logo.png";
import { Activity, CheckCircle2, ClipboardList, Monitor, Wrench } from "lucide-react";
import { useEffect } from "react";
export default function LoginPage() {

    useEffect(()=>{
        document.title = "IlabCICT | Login";
    },[]);

    return (
        <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.92fr)] lg:bg-[#f6f7f9]">
            <section className="relative hidden min-h-screen overflow-hidden border-r border-zinc-200 bg-[#fff8f5] p-8 lg:flex lg:flex-col xl:p-12">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#bf3419]/8">
                        <img src={Logo} alt="" className="h-8 w-auto" />
                    </div>
                    <span className="leading-tight">
                        <span className="block text-sm font-black text-zinc-950">iLabCICT</span>
                        <span className="block text-xs font-semibold text-zinc-500">Laboratory Operations</span>
                    </span>
                </div>

                <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-center py-8">
                    <div className="max-w-[620px]">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#bf3419]/15 bg-white px-4 py-2 text-xs font-bold uppercase text-[#bf3419] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                            Laboratory maintenance platform
                        </div>
                        <h1 className="mt-5 text-4xl font-black leading-[1.05] text-zinc-950 xl:text-6xl">
                            Keep every lab request in motion.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-zinc-600 xl:text-base">
                            One reliable workspace for faculty requests, technician workflows, laboratory assets, and reports.
                        </p>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-2 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
                        <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
                            <span className="size-2.5 rounded-full bg-[#bf3419]" />
                            <span className="size-2.5 rounded-full bg-[#f4aa29]" />
                            <span className="size-2.5 rounded-full bg-emerald-500" />
                            <span className="ml-2 text-xs font-bold uppercase text-zinc-400">
                                Live operations
                            </span>
                            <Activity size={15} className="ml-auto text-emerald-600" />
                        </div>

                        <div className="grid gap-3 rounded-[18px] bg-[#fafafa] p-3 xl:grid-cols-[1.25fr_0.75fr] xl:p-4">
                            <div className="space-y-2.5">
                                <OperationRow
                                    icon={ClipboardList}
                                    title="New faculty report"
                                    detail="Monitor issue in SLD 1"
                                    status="Queued"
                                />
                                <OperationRow
                                    icon={Wrench}
                                    title="Technician assigned"
                                    detail="Repair moved to ongoing"
                                    status="Live"
                                />
                                <OperationRow
                                    icon={CheckCircle2}
                                    title="Ticket resolved"
                                    detail="Maintenance history synced"
                                    status="Done"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
                                <Metric icon={ClipboardList} value="18" label="Open tickets" />
                                <Metric icon={Monitor} value="12" label="Active labs" />
                                <Metric icon={CheckCircle2} value="96%" label="Resolved" />
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs font-semibold text-zinc-400">CICT laboratory management system</p>
            </section>

            <section className="flex min-h-screen items-center justify-center bg-white lg:px-10 xl:px-16">
                <div className="w-full lg:max-w-[500px]">
                <LoginForm />
                </div>
            </section>
        </main>
    );
}

type IconComponent = typeof Activity;

type OperationRowProps = {
    icon: IconComponent;
    title: string;
    detail: string;
    status: string;
};

function OperationRow({ icon: Icon, title, detail, status }: OperationRowProps) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#bf3419]/8 text-[#bf3419]">
                <Icon size={17} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-zinc-900">{title}</span>
                <span className="block truncate text-xs font-medium text-zinc-500">{detail}</span>
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {status}
            </span>
        </div>
    );
}

type MetricProps = {
    icon: IconComponent;
    value: string;
    label: string;
};

function Metric({ icon: Icon, value, label }: MetricProps) {
    return (
        <div className="flex min-w-0 flex-col justify-between rounded-xl border border-zinc-100 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <Icon size={16} className="text-[#bf3419]" />
            <span className="mt-3 text-xl font-black text-zinc-950">{value}</span>
            <span className="truncate text-xs font-semibold text-zinc-500">{label}</span>
        </div>
    );
}
