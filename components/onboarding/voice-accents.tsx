import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { DrewVoiceAccent } from "@/lib/types";

interface VoiceAccentsProps {
  drewVoiceAccent: DrewVoiceAccent | null;
  setDrewVoiceAccent: (accent: string) => void;
  selectedAccent: string;
}

export function VoiceAccents({ setDrewVoiceAccent, selectedAccent }: VoiceAccentsProps) {
  const genders = ["Male", "Female"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Label>Voice Accents</Label>
      </div>
      <Select value={selectedAccent} onValueChange={setDrewVoiceAccent}>
        <SelectTrigger className="py-5 w-[200px] rounded-full">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent className="flex flex-col gap-6">
          {genders.map((gender, index) => (
            <SelectItem
              key={gender}
              value={gender}
              className={`cursor-pointer rounded-none px-2 py-2 gap-4 flex items-center ${index !== genders.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <p className="text-lg font-medium">{gender}</p>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}