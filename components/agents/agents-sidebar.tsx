import Image from 'next/image';
import React from 'react';

const menuItems = [
  { name: 'Functions', icon: '/functions.svg' },
  { name: 'Knowledge Base', icon: '/knowledge-base.svg' },
  { name: 'Speech Settings', icon: '/speech-settings.svg' },
  { name: 'Call Settings', icon: '/call-settings.svg' },
];

function AgentSidebar() {
  return (
    <div>
      {menuItems?.map((item, index) => (
        <div key={index} className="py-3">
          <div className="flex items-center gap-x-2 cursor-pointer">
            <Image src={item.icon} alt={item.name} width={24} height={24} />
            <div className="font-normal text-lg">{item.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgentSidebar;
