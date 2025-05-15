import React from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { leadPlatforms } from '@/utility/constants';
import { Switch } from '@/components/ui/switch';

const LeadPlatformAccordion = () => {
  return (
    <Accordion type="single" collapsible className="border-none">
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="text-base font-medium hover:no-underline">
        Connect your favorite lead platforms to keep Drew busy.
        </AccordionTrigger>
        {leadPlatforms.map((platform) => (
          <AccordionContent key={platform.value} className="border-none py-3">
            <div className={`flex items-center justify-between pb-4 ${platform === leadPlatforms[leadPlatforms.length - 1] ? '' : 'border-b border-gray-200'}`}>
              <div className="flex flex-row items-center gap-3">
                <div className="icon">
                  <Image src={platform.iconUrl} alt={platform.label} width={35} height={20} />
                </div>
                <div>
                  <h3 className="text-md font-medium">{platform.label}</h3>
                </div>
              </div>
              <div>
                <Switch />
              </div>
            </div>
          </AccordionContent>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

export default LeadPlatformAccordion;