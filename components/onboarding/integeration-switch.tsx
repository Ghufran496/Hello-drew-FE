import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
// import LockedFeature from "./locked-feature";

export const IntegrationSwitch = ({ platform, isLoading, isSynced, onSwitchChange }: { platform: { name: string; icon: string }; isLoading: boolean; isSynced: boolean; onSwitchChange: (checked: boolean, platform: string) => void }) => (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex flex-row items-center gap-3">
        <div className="icon">
          <Image src={`/${platform.icon}`} alt={platform.name} width={35} height={20} />
        </div>
        <div>
          <h3 className={`text-md font-medium `}>{platform.name}</h3>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isLoading && platform.name !== "Google Calendar" && (
          <div className="flex items-center gap-1">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {/* {platform.name === "Google Calendar" && (
          <div>
            <div className="flex items-center gap-4">
              <LockedFeature />
                </div>
            </div>
          )} */}
        <Switch
          onCheckedChange={(checked) => onSwitchChange(checked, platform.name)}
          checked={isSynced}
        />
      </div>
    </div>
  );