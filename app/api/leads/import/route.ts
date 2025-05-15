import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema/leads';

interface CSVLead {
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  stage: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads: csvLeads, userId } = body;

    if (!userId || !Array.isArray(csvLeads)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const validLeads = csvLeads.filter((lead: CSVLead) => 
      lead.name && 
      lead.email && 
      lead.phone
    );

    const leadsToInsert = validLeads.map((lead: CSVLead) => ({
      user_id: userId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status || 'new',
      source: lead.source || 'import',
      lead_details: {
        stage: lead.stage || 'Lead',
      },
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const newLeads = await db
      .insert(leads)
      .values(leadsToInsert)
      .returning();

    return NextResponse.json({
      message: `Successfully imported ${newLeads.length} leads`,
      leads: newLeads
    });
  } catch (error) {
    console.error('Error importing leads:', error);
    return NextResponse.json(
      { error: 'Failed to import leads' },
      { status: 500 }
    );
  }
} 