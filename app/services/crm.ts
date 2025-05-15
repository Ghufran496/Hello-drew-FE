type CRMSource = 'FollowUpBoss';

interface Lead {
    external_id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
}

async function fetchLeadsFromCRM(source: CRMSource, apiKey: string): Promise<Lead[]> {
    switch (source) {
        case 'FollowUpBoss':
            return await fetchFollowUpBossLeads(apiKey);
        default:
            throw new Error('CRM not supported');
    }
}

async function fetchFollowUpBossLeads(apiKey: string): Promise<Lead[]> {
    try {
        const response = await fetch('https://api.followupboss.com/v1/people', {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leads from Follow Up Boss');
        }

        const data = await response.json();
        console.log(data);
        return data.people.map((person: { 
            id: string; 
            firstName: string; 
            lastName: string; 
            emails?: {value: string}[];
            phones?: {value: string}[];
            stage?: string 
        }) => ({
            external_id: person.id,
            name: `${person.firstName} ${person.lastName}`,
            email: person.emails?.[0]?.value || '',
            phone: person.phones?.[0]?.value || '',
            status: person.stage || 'New'
        }));
    } catch (error) {
        console.error('Error fetching Follow Up Boss leads:', error);
        throw error;
    }
}

export { fetchLeadsFromCRM };