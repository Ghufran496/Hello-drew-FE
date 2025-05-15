import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Check, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Integration {
  platformName: string;
  credentials: {
    access_token: string;
  };
}

export function IntegrationsTable() {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    followupboss: false,
    hubspot: false
  });
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_onboarding');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserId(parsedData.id);
      checkIntegrations(parsedData.id);
    }
  }, []);

  const checkIntegrations = async (userId: number) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.userIntegrations);
      }
    } catch (error) {
      console.error('Error checking integrations:', error);
    }
  };

  const handleFollowUpBossConnect = async () => {
    if (!userId) return;
    
    setIsLoading(prev => ({ ...prev, followupboss: true }));
    try {
      const response = await fetch(`/api/onboarding/followupboss/login?userId=${userId}&returnTo=settings`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to connect to Follow Up Boss');
      }
    } catch (error) {
      console.error('Error connecting to Follow Up Boss:', error);
      toast.error('Failed to connect to Follow Up Boss');
    } finally {
      setIsLoading(prev => ({ ...prev, followupboss: false }));
    }
  };

  const handleHubSpotConnect = async () => {
    if (!userId) return;
    
    setIsLoading(prev => ({ ...prev, hubspot: true }));
    try {
      const response = await fetch(`/api/onboarding/hubspot/login?userId=${userId}&returnTo=settings`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to connect to HubSpot');
      }
    } catch (error) {
      console.error('Error connecting to HubSpot:', error);
      toast.error('Failed to connect to HubSpot');
    } finally {
      setIsLoading(prev => ({ ...prev, hubspot: false }));
    }
  };

  const handleDisconnect = async (platformName: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, platformName })
      });

      if (response.ok) {
        await checkIntegrations(userId);
        toast.success(`Disconnected from ${platformName}`);
      } else {
        toast.error(`Failed to disconnect from ${platformName}`);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error(`Failed to disconnect from ${platformName}`);
    }
  };

  const isConnected = (platformName: string) => {
    return integrations.some(integration => integration.platformName === platformName);
  };

  return (
    <div className="md:p-4 w-full h-[100vh] md:h-auto">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">CRM</h2>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table className="px-12 text-xs md:text-md">
            <TableBody>
              <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                  <div className="flex justify-start items-center gap-3">
                    <Image src='/followupboss.png' className="rounded-sm" width={30} height={30} alt="followupboss"/>
                    <h1 className="text-xs lg:text-lg">Follow Up Boss</h1>
                  </div>
                </TableCell>
                <TableCell className="w-1/3">
                  <div className="flex justify-center items-center gap-2">
                    {isConnected('followupboss') ? (
                      <>
                        <p>Connected</p>
                        <Check className="w-5 h-5 text-green-500" />
                      </>
                    ) : (
                      <p>Not Connected</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-1/3">
                  <div className="flex justify-end items-center w-full gap-3">
                    {isConnected('followupboss') ? (
                      <>
                        <p className="text-gray-400">Last synced recently</p>
                        <Button 
                          className="font-semibold" 
                          variant="outline"
                          onClick={() => handleDisconnect('followupboss')}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="font-semibold" 
                        variant="outline"
                        onClick={handleFollowUpBossConnect}
                        disabled={isLoading.followupboss}
                      >
                        {isLoading.followupboss ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Connect
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                  <div className="flex justify-start items-center gap-3">
                    <Image src='/hubspot.png'  width={60} height={30} alt="hubspot"/>
                    <h1 className="text-xs lg:text-lg">HubSpot</h1>
                  </div>
                </TableCell>
                <TableCell className="w-1/3">
                  <div className="flex justify-center items-center gap-2">
                    {isConnected('hubspot') ? (
                      <>
                        <p>Connected</p>
                        <Check className="w-5 h-5 text-green-500" />
                      </>
                    ) : (
                      <p>Not Connected</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-1/3">
                  <div className="flex justify-end items-center w-full gap-3">
                    {isConnected('hubspot') ? (
                      <>
                        <p className="text-gray-400">Last synced recently</p>
                        <Button 
                          className="font-semibold" 
                          variant="outline"
                          onClick={() => handleDisconnect('hubspot')}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="font-semibold" 
                        variant="outline"
                        onClick={handleHubSpotConnect}
                        disabled={isLoading.hubspot}
                      >
                        {isLoading.hubspot ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Connect
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow
                className="h-20 flex justify-between items-center" 
              >
                  <TableCell className="w-1/3">
                      <div className="flex justify-start items-center gap-3">
                          <Image src='/lofty.png' className="rounded-sm" width={30} height={30} alt="lofty"/>
                          <h1 className="text-xs lg:text-lg">Lofty</h1>
                      </div>
                  </TableCell>
                  <TableCell className="w-1/3">
                      <div className="flex justify-center items-center gap-2">  
                      <p>Connected</p>
                      <Check className="w-5 h-5 text-green-500" />
                      </div>
                  </TableCell>
                  <TableCell className="w-1/3">
                      <div className="flex justify-end items-center w-full gap-3">
                      <p className="text-gray-400">Last synced 2m ago</p>
                      <Button className="font-semibold" variant="outline">Disconnect</Button>
                      </div>
                  </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Calendar</h2>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table className="px-12 text-xs md:text-md">
          <TableBody>
            <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                    <div className="flex justify-start items-center gap-3">
                        <Image src='/googleCalendar.svg' width={30} height={30} alt="google calendar"/>
                        <h1 className="text-xs lg:text-lg">Google Calendar</h1>
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-center items-center gap-2">  
                    <p>Connected</p>
                    <Check className="w-5 h-5 text-green-500" />
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-end items-center w-full gap-3">
                    <p className="text-gray-400">Last synced 5m ago</p>
                    <Button className="font-semibold" variant="outline">Disconnect</Button>
                    </div>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      </div>

      <div>
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Meeting</h2>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table className="px-12 text-xs md:text-md">
          <TableBody>
            <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                    <div className="flex justify-start items-center gap-3">
                        <Image src='/meet.svg' width={30} height={30} alt="google meet"/>
                        <h1 className="text-xs lg:text-lg">Google Meet</h1>
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-center items-center gap-2">  
                    <p>Connected</p>
                    <Check className="w-5 h-5 text-green-500" />
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-end items-center w-full gap-3">
                    <p className="text-gray-400">Last synced 1m ago</p>
                    <Button className="font-semibold" variant="outline">Disconnect</Button>
                    </div>
                </TableCell>
            </TableRow>

            <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                    <div className="flex justify-start items-center gap-3">
                        <Image src='/zoom.svg' width={30} height={30} alt="zoom"/>
                        <h1 className="text-xs lg:text-lg">Zoom</h1>
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-center items-center gap-2">  
                    <p>Connected</p>
                    <Check className="w-5 h-5 text-green-500" />
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-end items-center w-full gap-3">
                    <p className="text-gray-400">Last synced 3m ago</p>
                    <Button className="font-semibold" variant="outline">Disconnect</Button>
                    </div>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      </div>

      <div>
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Lead Platform</h2>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table className="px-12 text-xs md:text-md">
          <TableBody>
            <TableRow className="h-20 flex justify-between items-center">
                <TableCell className="w-1/3">
                    <div className="flex justify-start items-center gap-3">
                        <Image src='/realtor.png' width={30} height={30} alt="realtor"/>
                        <h1 className="text-xs lg:text-lg">Realtor</h1>
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-center items-center gap-2">  
                    <p>Connected</p>
                    <Check className="w-5 h-5 text-green-500" />
                    </div>
                </TableCell>
                <TableCell className="w-1/3">
                    <div className="flex justify-end items-center w-full gap-3">
                    <p className="text-gray-400">Last synced 10m ago</p>
                    <Button className="font-semibold" variant="outline">Disconnect</Button>
                    </div>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  )
}
