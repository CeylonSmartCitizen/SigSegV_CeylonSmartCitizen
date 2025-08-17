import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('API route: /api/appointments/queue GET called');
    console.log('Authorization header:', authHeader);
    
    // Forward the request to the API Gateway queue endpoint
    const response = await fetch('http://localhost:3000/api/appointments/queue', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'authorization': authHeader } : {})
      },
    });
    
    console.log('Backend queue response status:', response.status);
    const text = await response.text();
    console.log('Backend queue raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse backend queue response as JSON');
      return NextResponse.json({ success: false, message: 'Invalid backend response', raw: text }, { status: 500 });
    }
    
    console.log('Backend queue response data:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Queue GET proxy error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    console.log('API route: POST /api/appointments/queue called');
    console.log('Authorization header:', authHeader);
    console.log('Request body:', body);
    
    // Forward the request to the API Gateway queue endpoint
    const response = await fetch('http://localhost:3000/api/appointments/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    
    console.log('Backend queue response status:', response.status);
    const text = await response.text();
    console.log('Backend queue raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse backend queue response as JSON');
      return NextResponse.json({ success: false, message: 'Invalid backend response', raw: text }, { status: 500 });
    }
    
    console.log('Backend queue response data:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Queue POST proxy error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
