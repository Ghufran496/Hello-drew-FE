import { Trash } from "lucide-react";

export const UnavailableHours = ({ timings, onDelete }: { timings: { start: string; end: string }[]; onDelete: (index: number) => void }) => (
    <div className="flex flex-wrap mt-2 gap-2">
      {timings.map((timing, index) => (
        <div key={index} className="relative group">
          <p className="text-sm text-primary bg-[#E0EAFE] rounded-full p-3">
            {timing.start} - {timing.end}
          </p>
          <div
            className="absolute inset-0 rounded-full bg-red-500 bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={() => onDelete(index)}
          >
            <Trash className="text-white" size={20} />
          </div>
        </div>
      ))}
    </div>
  );