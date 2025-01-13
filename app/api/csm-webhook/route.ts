import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

type WebhookPayload = {
  type: string;
  data: {
    modelId: string;
    status: string;
    viewerUrl?: string;
    downloadUrl?: string;
  };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebhookPayload;
    console.log('Webhook received:', payload);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}