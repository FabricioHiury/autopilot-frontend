"use client"

import * as React from "react"
import { cn } from "@/lib/class-name.utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import IconRelogio from "../../sections/atendimentos/icons/icon-relogio"
import IconArrowNext from "../../icons/icon-next-arrow"

type TimeRangePickerProps = {
  onChange: (value: { start: string; end: string }) => void
}

export function TimeRangePicker({ onChange }: TimeRangePickerProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Estado para horas e minutos de INÍCIO
  const [startHour, setStartHour] = React.useState<number>(new Date().getHours())
  const [startMinute, setStartMinute] = React.useState<number>(
    new Date().getMinutes()
  )

  // Estado para horas e minutos de FIM
  const [endHour, setEndHour] = React.useState<number>(new Date().getHours()+1)
  const [endMinute, setEndMinute] = React.useState<number>(
    new Date().getMinutes()
  )

  // Atualiza o onChange quando qualquer valor de start ou end muda
  React.useEffect(() => {
    onChange({
      start: `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
      end: `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`,
    })
  }, [startHour, startMinute, endHour, endMinute])

  // A estrutura de UI para selecionar hora/minuto
  const TimerRange = () => {
    const handleHourPlus = (type: "start" | "end") => {
      if (type === "start") {
        setStartHour((prev) => (prev < 23 ? prev + 1 : 0))
      } else {
        setEndHour((prev) => (prev < 23 ? prev + 1 : 0))
      }
    }

    const handleHourMinus = (type: "start" | "end") => {
      if (type === "start") {
        setStartHour((prev) => (prev > 0 ? prev - 1 : 23))
      } else {
        setEndHour((prev) => (prev > 0 ? prev - 1 : 23))
      }
    }

    const handleMinutePlus = (type: "start" | "end") => {
      if (type === "start") {
        setStartMinute((prev) => (prev < 59 ? prev + 1 : 0))
      } else {
        setEndMinute((prev) => (prev < 59 ? prev + 1 : 0))
      }
    }

    const handleMinuteMinus = (type: "start" | "end") => {
      if (type === "start") {
        setStartMinute((prev) => (prev > 0 ? prev - 1 : 59))
      } else {
        setEndMinute((prev) => (prev > 0 ? prev - 1 : 59))
      }
    }

    const handleInputHour = (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "start" | "end"
    ) => {
      const value = parseInt(e.target.value)
      if (value >= 0 && value <= 23) {
        type === "start" ? setStartHour(value) : setEndHour(value)
      }
    }

    const handleInputMinute = (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "start" | "end"
    ) => {
      const value = parseInt(e.target.value)
      if (value >= 0 && value <= 59) {
        type === "start" ? setStartMinute(value) : setEndMinute(value)
      }
    }

    return (
      <div
        className="bg-white w-full py-6 px-3 rounded-[0.5rem]"
        style={{
          width: buttonRef.current?.offsetWidth,
        }}
      >
        {/* Container das colunas (Início e Fim) */}
        <div className="flex items-center justify-center gap-4">
          {/* Coluna de INÍCIO */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleHourPlus("start")}
              className="-rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
            <input
              value={startHour}
              onChange={(e) => handleInputHour(e, "start")}
              type="text"
              className="border p-2 text-lg rounded-[0.5rem] w-14 text-center font-semibold my-1"
            />
            <button
              onClick={() => handleHourMinus("start")}
              className="rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
          </div>

          <span className="text-xl font-semibold">:</span>

          <div className="flex flex-col items-center">
            <button
              onClick={() => handleMinutePlus("start")}
              className="-rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
            <input
              value={startMinute}
              onChange={(e) => handleInputMinute(e, "start")}
              type="text"
              className="border p-2 text-lg rounded-[0.5rem] w-14 text-center font-semibold my-1"
            />
            <button
              onClick={() => handleMinuteMinus("start")}
              className="rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
          </div>

          {/* Separador visual */}
          <div className="text-slate-600">até as</div>

          {/* Coluna de FIM */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleHourPlus("end")}
              className="-rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
            <input
              value={endHour}
              onChange={(e) => handleInputHour(e, "end")}
              type="text"
              className="border p-2 text-lg rounded-[0.5rem] w-14 text-center font-semibold my-1"
            />
            <button
              onClick={() => handleHourMinus("end")}
              className="rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
          </div>

          <span className="text-xl font-semibold">:</span>

          <div className="flex flex-col items-center">
            <button
              onClick={() => handleMinutePlus("end")}
              className="-rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
            <input
              value={endMinute}
              onChange={(e) => handleInputMinute(e, "end")}
              type="text"
              className="border p-2 text-lg rounded-[0.5rem] w-14 text-center font-semibold my-1"
            />
            <button
              onClick={() => handleMinuteMinus("end")}
              className="rotate-90 bg-slate-300 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <IconArrowNext />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Formata o texto para exibição no botão
  const startString = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
  const endString = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

  const displayLabel =
    startHour !== null && startMinute !== null && endHour !== null && endMinute !== null
      ? `${startString} - ${endString}`
      : "Selecione um intervalo"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-full rounded-[0.5rem] border border-input bg-white px-3 py-1 text-sm transition-colors items-center justify-between",
          )}
          ref={buttonRef}
        >
          <div className="flex items-center gap-2">
            <IconRelogio />
            <span>{displayLabel}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#000000"
            viewBox="0 0 256 256"
          >
            <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34ZM85.66,85.66,128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="portal w-full p-0">
        <TimerRange />
      </PopoverContent>
    </Popover>
  )
}
