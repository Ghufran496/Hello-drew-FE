import { CRM_OPTIONS } from "@/utility/constants";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import LockedFeature from "@/components/onboarding/locked-feature";
import Image from "next/image";
export const CRMSelection = ({ gotoCrm, setGotoCrm }: { gotoCrm: string; setGotoCrm: (value: string) => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3">
        <Label>Select CRM</Label>
        <Select  value={gotoCrm !== null ? gotoCrm : ""} onValueChange={(value) => setGotoCrm(value)}>
          <SelectTrigger className="py-5 rounded-full">
            <SelectValue placeholder="Choose CRM" />
          </SelectTrigger>
          <SelectContent className="flex flex-col gap-6">
            {CRM_OPTIONS.map((option, index) => (
              <SelectItem
                key={index}
                value={option.value}
                className={`cursor-pointer rounded-none px-4 py-4 gap-4 ${
                  index !== CRM_OPTIONS.length - 1 ? "border-b border-gray-200" : ""
                } flex items-center`}
                disabled={index >= CRM_OPTIONS.length - 2}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={option.iconUrl}
                    alt={option.label}
                    width={40}
                    height={30}
                    className="w-10 h-8 object-contain"
                  />
                  <p className="text-lg font-medium">{option.label}</p>
                </div>
                {index >= CRM_OPTIONS.length - 2 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    <LockedFeature />
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );