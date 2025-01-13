// app/api/csm-webhook/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const headersList = headers()
  
  // Verify webhook signature if CSM.ai provides one
  // const signature = headersList.get('x-csm-signature')
  
  try {
    const payload = await request.json()
    
    // Example webhook payload from CSM.ai might look like:
    // {
    //   type: 'model.completed',
    //   data: {
    //     modelId: '123',
    //     status: 'completed',
    //     viewerUrl: 'https://...',
    //     downloadUrl: 'https://...'
    //   }
    // }

    console.log('Webhook received:', payload)

    // Here you would typically:
    // 1. Update your database with the model status
    // 2. Notify your frontend about the completion
    // 3. Store the viewer/download URLs

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}