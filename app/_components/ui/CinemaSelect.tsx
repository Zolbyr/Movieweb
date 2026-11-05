"use client";

import { Label, ListBox, Select } from "@heroui/react";
import { Check, ChevronDown } from "lucide-react";
import { type ProviderId } from "../../../lib/cinemas";
import { CinemaBrand } from "./CinemaBrand";

export function CinemaSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { id: string; label: string; provider?: ProviderId }[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.id === value);
  return <Select aria-label={label} className="cinema-select" value={value} onChange={(key) => { if (key !== null) onChange(String(key)); }}>
    <Label>{label}</Label>
    <Select.Trigger><Select.Value>{selected?.provider ? <CinemaBrand provider={selected.provider} /> : selected?.label}</Select.Value><Select.Indicator><ChevronDown size={16} aria-hidden="true" /></Select.Indicator></Select.Trigger>
    <Select.Popover className="cinema-select-popover">
      <ListBox items={options} aria-label={label}>
        {(option) => <ListBox.Item id={option.id} textValue={option.label}><Label>{option.provider ? <CinemaBrand provider={option.provider} /> : option.label}</Label><ListBox.ItemIndicator><Check size={15} aria-hidden="true" /></ListBox.ItemIndicator></ListBox.Item>}
      </ListBox>
    </Select.Popover>
  </Select>;
}
