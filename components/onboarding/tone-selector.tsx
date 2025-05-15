import { Label } from "@/components/ui/label";
import Image from "next/image";

interface ToneSelectorProps {
  drewTone: string;
  setDrewTone: (tone: string) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ drewTone, setDrewTone }) => {
  const tones = ["Friendly", "Polished", "Humorous"];

  const handleToneChange = (tone: string) => {
    setDrewTone(tone);
    const labels = document.querySelectorAll('label[id="tone"]');
    labels.forEach(label => {
      if (label.querySelector(`input[value="${tone}"]`)) {
        label.classList.add('border-primary', 'bg-blue-100');
      } else {
        label.classList.remove('border-primary', 'bg-blue-100');
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>Select Drew&apos;s Tone</Label>
      <div className="flex gap-4">
        {tones.map((tone, index) => {
          const toneValue = tone.toLowerCase();
          const isSelected = drewTone === toneValue;
          return (
            <label
              id="tone"
              key={`tone-${index}`}
              className={`flex items-center gap-2 cursor-pointer border-[1px] rounded-full px-4 py-1 ${isSelected ? 'border-primary bg-blue-100' : ''}`}
            >
              <input
                type="radio"
                name="drew-tone"
                value={toneValue}
                className="form-radio hidden"
                checked={isSelected}
                onChange={() => handleToneChange(toneValue)}
              />
              <Image src="/PlayCircle.svg" alt={`Drew's ${tone} tone`} width={40} height={40}  />
              <span className="text-base">{tone}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};