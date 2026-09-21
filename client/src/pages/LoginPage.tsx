import LoginForm from "@/components/LoginForm/LoginForm";
import "@/styles/system.css"
import Logo from "@/assets/logo.png";
import {
    Bell,
    ClipboardList,
    FileClock,
    Monitor,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import { useEffect } from "react";
export default function LoginPage() {

    useEffect(()=>{
        document.title = "ILabCICT | Login";
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
                            Role-based laboratory support
                        </div>
                        <h1 className="mt-5 text-4xl font-black leading-[1.05] text-zinc-950 xl:text-6xl">
                            Report, resolve, and track every lab issue.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-zinc-600 xl:text-base">
                            One workspace for laboratory tickets, computer inventory, maintenance records, and role-based operations.
                        </p>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
                        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4">
                            <span className="size-2.5 rounded-full bg-[#bf3419]" />
                            <span className="size-2.5 rounded-full bg-[#f4aa29]" />
                            <span className="size-2.5 rounded-full bg-emerald-500" />
                            <span className="ml-2 text-xs font-bold uppercase text-zinc-400">
                                iLabCICT workflow
                            </span>
                            <ShieldCheck size={16} className="ml-auto text-[#bf3419]" />
                        </div>

                        <div className="grid bg-[#fafafa] xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="divide-y divide-zinc-200 px-5 py-2">
                                <WorkflowRow
                                    icon={ClipboardList}
                                    role="Faculty"
                                    title="Report an issue or request"
                                    detail="Create tickets for laboratory rooms and computers."
                                />
                                <WorkflowRow
                                    icon={Wrench}
                                    role="Technician"
                                    title="Process assigned work"
                                    detail="Claim tickets, update equipment, and record repairs."
                                />
                                <WorkflowRow
                                    icon={ShieldCheck}
                                    role="Admin"
                                    title="Oversee laboratory operations"
                                    detail="Manage tickets, laboratories, users, and system records."
                                />
                            </div>

                            <div className="border-t border-zinc-200 bg-white px-5 py-4 xl:border-t-0 xl:border-l">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Connected records
                                </p>
                                <div className="mt-3 space-y-3">
                                    <SystemFeature
                                        icon={Monitor}
                                        title="Laboratory inventory"
                                        detail="Rooms, computers, and specifications"
                                    />
                                    <SystemFeature
                                        icon={FileClock}
                                        title="Maintenance records"
                                        detail="Repair logs and request history"
                                    />
                                    <SystemFeature
                                        icon={Bell}
                                        title="Realtime updates"
                                        detail="Tickets, rooms, and notifications"
                                    />
                                </div>
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

type IconComponent = typeof Monitor;

type WorkflowRowProps = {
    icon: IconComponent;
    role: string;
    title: string;
    detail: string;
};

function WorkflowRow({ icon: Icon, role, title, detail }: WorkflowRowProps) {
    return (
        <div className="flex items-center gap-3 py-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#bf3419]/8 text-[#bf3419]">
                <Icon size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase text-[#bf3419]">
                    {role}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-zinc-900">
                    {title}
                </span>
                <span className="mt-0.5 block text-xs font-medium leading-5 text-zinc-500">
                    {detail}
                </span>
            </span>
        </div>
    );
}

type SystemFeatureProps = {
    icon: IconComponent;
    title: string;
    detail: string;
};

function SystemFeature({ icon: Icon, title, detail }: SystemFeatureProps) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[#bf3419]">
                <Icon size={14} aria-hidden="true" />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-bold text-zinc-900">{title}</span>
                <span className="mt-0.5 block text-xs font-medium leading-5 text-zinc-500">
                    {detail}
                </span>
            </span>
        </div>
    );
}
