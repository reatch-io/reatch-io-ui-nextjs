import { useState } from "react";

export function TagsInput({
    value,
    onChange,
    type = "text",
    disabled = false,
}: {
    value: any[];
    onChange: (v: any[]) => void;
    type?: any;
    disabled?: boolean;
}) {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            onChange([...value, input.trim()]);
            setInput("");
        }
        if (e.key === "Backspace" && !input && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div
            className="flex flex-wrap items-center gap-1 border px-2 py-1 w-40 grow min-h-[38px] w-full"
            style={{ borderRadius: 8, fontSize: 14, background: disabled ? "#f3f4f6" : undefined }}
        >
            {value.map((tag, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            className="ml-1 text-blue-700 hover:text-red-500"
                            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                            tabIndex={-1}
                        >
                            ×
                        </button>
                    )}
                </span>
            ))}
            {!disabled && (
                <input
                    className="flex-1 outline-none min-w-[40px] bg-transparent"
                    type={type}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add value"
                    style={{ fontSize: 14 }}
                    disabled={disabled}
                />
            )}
        </div>
    );
}