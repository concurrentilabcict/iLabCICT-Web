
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { MaintenanceHistory } from "@/types/maintenanceHistory";
import { ImageOff, User, CalendarDays, BadgeCheck } from "lucide-react";
import { Layers2 } from "lucide-react";
import { formatDateTime } from "@/utils/string";

import { capitalize } from "@/utils/string";

type MaintenanceHistoryDetailsType = {
    maintenanceHistory: MaintenanceHistory | undefined
}

export default function MaintenanceHistoryDetails({
    maintenanceHistory
}: MaintenanceHistoryDetailsType){

    return(
        <>
        <SheetHeader>
                <SheetTitle className="text-lg font-semibold"> History | {maintenanceHistory?.maintenanceHistoryCode}</SheetTitle>
                    <SheetDescription>
                    View the complete details of this maintenance record.
                </SheetDescription>
        </SheetHeader>


        <div className="flex flex-1 flex-col gap-6 px-4">

        <div className="flex flex-col gap-y-2">
        <span className="text-lg font-medium">{capitalize(maintenanceHistory?.repairLog.title || "")}</span>
          {maintenanceHistory?.repairLog.ticket.issueImage ? (
            <img
              src={maintenanceHistory?.repairLog.ticket.issueImage}
              alt={maintenanceHistory?.repairLog.title}
              className="h-50 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
              <ImageOff size={28} />
              <span className="text-sm font-medium">No image attached</span>
            </div>
          )}

          <div>
            <h3 className="font-medium secondary-text-color">Maintenance Notes:</h3>
            <p>{maintenanceHistory?.maintenanceNotes}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <BadgeCheck size={14} />
            <h3>Status</h3>
          </div>
          <span>{capitalize(maintenanceHistory?.repairLog.ticket.status || "")}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Layers2 size={14} />
            <h3>Type</h3>
          </div>
          <span>{capitalize(maintenanceHistory?.maintenanceType || "")}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <User size={14} />
            <h3>Performed By</h3>
          </div>
          <p>
            {maintenanceHistory?.performedBy}
          </p>
        </div>

        <div className={`flex items-center justify-between `}>
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <CalendarDays size={14} />
            <h3>Date Performed</h3>
          </div>
          <span>{formatDateTime(maintenanceHistory?.datePerformed || "")}</span>
        </div>


      </div>


        <SheetFooter className={``}>

                <SheetClose asChild>
                <Button type="button"  variant="outline"  className="hover:cursor-pointer">
                    Close
                </Button>
                </SheetClose>
            </SheetFooter>
        </>
    );

};