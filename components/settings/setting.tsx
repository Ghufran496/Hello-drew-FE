import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NavSettings } from "./nav-settings"
import { Profile } from "./profile"
import { Notification } from "./notification"
import { Access } from "./access"
import { Password } from "./password"
import { WorkSpace } from "./workspace"

const componentsMap: Record<string, React.FC> = {
  "User Profile": Profile,
  "Access Levels & Teams": Access,
  "Notifications": Notification,
  "Customize Drew": WorkSpace,
  "Password Management": Password
};

export function Setting() {
  const [activeComponent, setActiveComponent] = useState<string>("User Profile");
  const ActiveComponent = componentsMap[activeComponent] || (() => <div>Select a setting</div>);

  return (
    <div className="flex justify-between md:flex-row flex-col items-start gap-2 w-full">
      <NavSettings onSelect={setActiveComponent} />
      
      <div className="w-[100vw] md:w-full md:overflow-hidden overflow-y-scroll  md:flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeComponent} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
