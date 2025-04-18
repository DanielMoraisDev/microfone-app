import * as React from "react";
import {
  format,
  getMonth,
  getYear,
  setMonth,
  // setYear,
  setHours,
  setMinutes,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "./select";
import { Label } from "./label";

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}

export function DatePicker({
  // startYear = getYear(new Date()) - 100,
  // endYear = getYear(new Date()) + 100,
  selected,
  onSelect,
  disabledDates,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date>(selected ?? new Date());
  const [_selectedYear, setSelectedYear] = React.useState<string>(
    getYear(date).toString()
  );

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  // const currentYear = new Date().getFullYear();

  // const years = React.useMemo(() => {
  //   const start = currentYear - 80;
  //   const end = currentYear;
  //   return Array.from({ length: end - start + 1 }, (_, i) =>
  //     (start + i).toString()
  //   );
  // }, []);

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, months.indexOf(month));
    setDate(newDate);
    onSelect(newDate);
  };

  // const handleYearChange = (year: string) => {
  //   const newDate = setYear(date, parseInt(year));
  //   setDate(newDate);
  //   onSelect(newDate);
  // };

  const handleSelect = (selectData: Date | undefined) => {
    if (selectData) {
      setDate(selectData);
      onSelect(selectData);
    }
  };

  const handleTimeChange = (hour: string, minute: string) => {
    const newDate = setHours(
      setMinutes(date, parseInt(minute)),
      parseInt(hour)
    );
    setDate(newDate);
    onSelect(newDate);
  };

  React.useEffect(() => {
    if (selected) {
      setDate(selected);
      setSelectedYear(getYear(selected).toString());
    }
  }, [selected]);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "cursor-pointer justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? (
            format(date, "dd/MM/yyyy HH:mm")
          ) : (
            <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-col">
        <div className="flex flex-row pt-[10px] pl-[16px] pr-[16px]">
          <div className="w-full flex flex-col gap-1">
            <Label>Mês</Label>
            <Select
              onValueChange={handleMonthChange}
              value={months[getMonth(date)]}
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent className="max-h-70">
                {months.map((month) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={month}
                    value={month}
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* <div>
            <Select
              value={selectedYear}
              onValueChange={(year) => {
                handleYearChange(year);
                setSelectedYear(year);
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue>{selectedYear}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={year.toString()}
                    value={year}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          month={date}
          onMonthChange={setDate}
          disabled={disabledDates}
        />
        <div className="flex justify-between gap-2 pr-[16px] pl-[16px] pb-[10px]">
          <div className="w-full flex flex-col gap-1">
            <Label>Horas</Label>
            <Select
              onValueChange={(hour) => handleTimeChange(hour, minutes[0])}
              value={hours[date.getHours()]}
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder="Hora" />
              </SelectTrigger>
              <SelectContent className="max-h-70">
                {hours.map((hour) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={hour}
                    value={hour}
                  >
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-col gap-1">
            <Label>Minutos</Label>
            <Select
              onValueChange={(minute) =>
                handleTimeChange(hours[date.getHours()], minute)
              }
              value={minutes[date.getMinutes()]}
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder="Minuto" />
              </SelectTrigger>
              <SelectContent className="max-h-70">
                {minutes.map((minute) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={minute}
                    value={minute}
                  >
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
