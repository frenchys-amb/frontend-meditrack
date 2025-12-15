import { useState } from "react";
import { Form } from "react-bootstrap";

interface Props {
  name: string;
  recommended: number | boolean | string;
  actual: number;
  isMedication: boolean;
  onAdjust: (diff: number) => void;
}

export default function InventoryItemRow({
  name,
  recommended,
  actual,
  onAdjust,
}: Props) {
  const [value, setValue] = useState(0);

  return (
    <div className="p-2 mb-2 bg-dark border border-primary rounded text-white">

      <div className="d-flex justify-content-between mb-1">
        <strong>{name.replaceAll("_", " ")}</strong>
        <span>{actual} / {typeof recommended === "number" ? recommended : ""}</span>
      </div>

      <Form.Check
        label="Confirmado"
        checked={typeof recommended === "number" ? actual >= recommended : actual > 0}
        readOnly
      />

      <Form.Select
        className="mt-2 bg-dark text-white"
        value={value}
        onChange={(e) => {
          const diff = Number(e.target.value);
          setValue(diff);
          onAdjust(diff);
        }}
      >
        <option value="0">0</option>
        <option value="-1">-1</option>
        <option value="-2">-2</option>
        <option value="-3">-3</option>
        <option value="1">+1</option>
        <option value="2">+2</option>
        <option value="3">+3</option>
      </Form.Select>
    </div>
  );
}
