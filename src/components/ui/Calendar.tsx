"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" style={{ width: "16px", height: "16px" }} />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" style={{ width: "16px", height: "16px" }} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
