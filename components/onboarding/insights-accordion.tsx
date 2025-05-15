import React from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { insights } from '@/utility/constants';
import { Switch } from '@/components/ui/switch';

const InsightsAccordion = () => {
  return (
    <Accordion type="single" collapsible className="border-none">
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="text-base font-medium hover:no-underline">
        Insights drive success. Connect your tools to measure impact.
        </AccordionTrigger>
        {insights.map((insight) => (
          <AccordionContent key={insight.value} className="border-none py-3">
            <div className={`flex items-center justify-between pb-4 ${insight === insights[insights.length - 1] ? '' : 'border-b border-gray-200'}`}>
              <div className="flex flex-row items-center gap-3">
                <div className="icon">
                  <Image src={insight.iconUrl} alt={insight.label} width={35} height={20} />
                </div>
                <div>
                  <h3 className="text-md font-medium">{insight.label}</h3>
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

export default InsightsAccordion;