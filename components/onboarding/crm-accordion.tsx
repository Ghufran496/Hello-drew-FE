'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { systems } from '@/utility/constants';
import { Switch } from '@/components/ui/switch';
import LockedFeature from './locked-feature';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VisibilityState {
  followupboss: boolean;
  accessToken: boolean;
  salesforce: boolean;
}

interface VerificationState {
  followupboss: boolean;
  accessToken: boolean;
  salesforce: boolean;
}

interface Integration {
  platformName: string;
  credentials: Record<string, string>;
}

const CrmAccordion = () => {
  const [visible, setVisible] = useState<VisibilityState>({ followupboss: false, accessToken: false, salesforce: false });
  const [verified, setVerified] = useState<VerificationState>({ followupboss: false, accessToken: false, salesforce: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkIntegrations = async () => {
      setIsLoading(true);
      const userData = localStorage.getItem('user_onboarding');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (userId) {
        try {
          const response = await fetch(`/api/integrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          const result = await response.json();
          
          setVerified({
            followupboss: result.userIntegrations.some((i: Integration) => i.platformName === 'followupboss'),
            accessToken: result.userIntegrations.some((i: Integration) => i.platformName === 'hubspot'),
            salesforce: result.userIntegrations.some((i: Integration) => i.platformName === 'salesforce')
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error checking integrations:', error.message);
          }
        }
      }
      setIsLoading(false);
    };

    checkIntegrations();
  }, []);

  const handleSwitchChange = async (systemValue: string, checked: boolean) => {
    const userData = localStorage.getItem('user_onboarding');
    const userId = userData ? JSON.parse(userData).id : null;

    if (systemValue === "Follow Up Boss") {
      if (checked) {
        try {
          const response = await fetch(`/api/onboarding/followupboss/login?userId=${userId}`);
          const data: { url: string } = await response.json();
          if (data.url) {
            window.location.href = data.url;
          }
        } catch (error) {
          console.error('Error initiating Follow Up Boss OAuth:', error);
          toast.error('Failed to connect to Follow Up Boss');
        }
      } else {
        setVerified(prev => ({ ...prev, followupboss: false }));
        await removeIntegration(userId, "followupboss");
      }
    } else if (systemValue === "Hubspot") {
      if (checked) {
        try {
          const response = await fetch(`/api/onboarding/hubspot/login?userId=${userId}`);
          const data: { url: string } = await response.json();
          if (data.url) {
            window.location.href = data.url;
          }
        } catch (error) {
          console.error('Error initiating HubSpot OAuth:', error);
          toast.error('Failed to connect to HubSpot');
        }
      } else {
        setVerified(prev => ({ ...prev, accessToken: false }));
        await removeIntegration(userId, "hubspot");
      }
    } else if (systemValue === "Salesforce") {
      setVisible(prev => ({ ...prev, salesforce: checked }));
      if (!checked) {
        setVerified(prev => ({ ...prev, salesforce: false }));
        await removeIntegration(userId, "salesforce");
      }
    }
  };

  const removeIntegration = async (userId: string | null, platform: string): Promise<void> => {
    if (!userId) return;

    try {
      const response = await fetch('/api/integrations/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformName: platform, userId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove integration');
      }

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration removed successfully`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error removing integration:', error.message);
      }
      toast.error(`Failed to remove ${platform.charAt(0).toUpperCase() + platform.slice(1)} integration`);
    }
  };

  const handleDialogClose = (open: boolean): void => {
    setVisible({ followupboss: open, accessToken: open, salesforce: open });
  };

  interface System {
    value: string;
    label: string;
    iconUrl: string;
  }

  interface IntegrationDialogProps {
    system: System;
    isVisible: boolean;
    type: 'accessToken' | 'salesforce';
  }

  const IntegrationDialog = ({ system, isVisible, type }: IntegrationDialogProps) => {
    const handleSubmit = async (): Promise<void> => {
      setIsLoading(true);
      try {
        if (type === 'salesforce') {
          await verifySalesforceCredentials();
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error verifying credentials:', error.message);
        }
        toast.error('Verification failed');
      }
      setIsLoading(false);
      handleDialogClose(false);
    };

    return (
      <Dialog open={isVisible} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogTitle>
            Salesforce OAuth
          </DialogTitle>
          <DialogDescription>
            Please complete the OAuth process to proceed with Salesforce integration.
          </DialogDescription>
          <div className="flex justify-center">
            <Button
              disabled={isLoading}
              onClick={handleSubmit}
              className="mt-4 w-[200px]"
            >
              Sync {system.label} {isLoading && <Loader2 className="size-4 animate-spin" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const verifySalesforceCredentials = async (): Promise<void> => {
    setIsLoading(true);
    const userData = localStorage.getItem('user_onboarding');
    const userId = userData ? JSON.parse(userData).id : null;
    if (userId) {
      window.location.href = `/api/onboarding/crm/salesforce/login?userId=${userId}`;
    } else {
      console.error('User ID not found');
      toast.error('User ID not found');
    }
    setIsLoading(false);
  };

  return (
    <Accordion defaultValue="item-1" type="single" collapsible className="border-none">
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="text-base font-medium hover:no-underline">
          Sync your CRM to let Drew follow up with your leads seamlessly
        </AccordionTrigger>
        {systems.map((system, index) => (
          <AccordionContent key={system.value} className="border-none py-3">
            <div className={`flex items-center justify-between pb-4 ${system === systems[systems.length - 1] ? '' : 'border-b border-gray-200'}`}>
              <div className="flex flex-row items-center gap-3">
                <div className="icon">
                  <Image src={system.iconUrl} alt={system.label} width={35} height={20} className={`${index >= 3 ? 'opacity-50' : ''}`} />
                </div>
                <div>
                  <h3 className={`text-md font-medium ${index >= 3 ? 'opacity-50' : ''}`}>{system.label}</h3>
                </div>
              </div>
              <div className="relative">
                {index >= 3 && (
                  <div className="absolute right-20 top-1/2 -translate-y-1/2 z-10">
                    <LockedFeature />
                  </div>
                )}
                <Switch 
                  disabled={index >= 3} 
                  onCheckedChange={(checked) => handleSwitchChange(system.value, checked)}
                  checked={(system.value === "Follow Up Boss" && verified.followupboss) || 
                          (system.value === "Hubspot" && verified.accessToken) || 
                          (system.value === "Salesforce" && verified.salesforce)}
                />
              </div>
            </div>
            {system.value === "Salesforce" && visible.salesforce && (
              <IntegrationDialog system={system} isVisible={visible.salesforce} type="salesforce" />
            )}
          </AccordionContent>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

export default CrmAccordion;