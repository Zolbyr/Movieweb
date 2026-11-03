"use client";

import { Label, ListBox, Select } from "@heroui/react";

export function CinemaSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return <Select className="cinema-select" value={value} onChange={(key) => { if (key !== null) onChange(String(key)); }}>
    <Label>{label}</Label>
    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
    <Select.Popover className="cinema-select-popover">
      <ListBox items={options} aria-label={label}>
        {(option) => <ListBox.Item id={option.id} textValue={option.label}><Label>{option.label}</Label><ListBox.ItemIndicator /></ListBox.Item>}
      </ListBox>
    </Select.Popover>
  </Select>;
}
