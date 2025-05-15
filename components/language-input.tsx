import * as React from "react";
import { CheckIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const languages = [
  { label: "English", value: "en", flag: "🇺🇸" },
  { label: "Spanish", value: "es", flag: "🇪🇸" },
  { label: "French", value: "fr", flag: "🇫🇷" },
  { label: "German", value: "de", flag: "🇩🇪" },
  { label: "Chinese", value: "zh", flag: "🇨🇳" },
  { label: "Japanese", value: "ja", flag: "🇯🇵" },
  { label: "Korean", value: "ko", flag: "🇰🇷" },
];

type LanguageSelectProps = {
  value: string;
  onChange: (lang: string) => void;
};

const LanguageSelect = ({ value, onChange }: LanguageSelectProps) => {
  const selectedLanguage = languages.find((lang) => lang.value === value) || languages[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex h-12 w-full items-center justify-between gap-2 rounded-full border border-gray-300 bg-white px-4 shadow-sm hover:bg-gray-100"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <span className="text-muted-foreground text-sm">{selectedLanguage.label}</span>
          </div>
          <ChevronDown className="size-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {languages.map(({ value: langValue, label, flag }) => (
                  <LanguageOption
                    key={langValue}
                    value={langValue}
                    label={label}
                    flag={flag}
                    selectedValue={value}
                    onChange={onChange}
                  />
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface LanguageOptionProps {
  value: string;
  label: string;
  flag: string;
  selectedValue: string;
  onChange: (lang: string) => void;
}

const LanguageOption = ({ value, label, flag, selectedValue, onChange }: LanguageOptionProps) => {
  return (
    <CommandItem
      className="flex items-center gap-2 px-4 py-2"
      onSelect={() => {
        onChange(value);
      }}
    >
      <span className="text-xl">{flag}</span>
      <span className="flex-1 text-sm">{label}</span>
      <CheckIcon
        className={`ml-auto size-4 text-primary ${value === selectedValue ? "opacity-100" : "opacity-0"}`}
      />
    </CommandItem>
  );
};

export { LanguageSelect };
