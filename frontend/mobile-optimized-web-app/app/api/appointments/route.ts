import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('API route: /api/appointments called');
    console.log('Authorization header:', authHeader);
    // Forward the request to the API Gateway (working endpoint)
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'authorization': authHeader } : {})
      },
    });
    console.log('Backend response status:', response.status);
    const text = await response.text();
    console.log('Backend raw response:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse backend response as JSON');
      return NextResponse.json({ success: false, message: 'Invalid backend response', raw: text }, { status: 500 });
    }
    console.log('Backend response data:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Appointments proxy error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    console.log('API route: POST /api/appointments called');
    console.log('Authorization header:', authHeader);
    console.log('Request body:', body);
    
    // Forward the request to the API Gateway
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    
    console.log('Backend response status:', response.status);
    const text = await response.text();
    console.log('Backend raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse backend response as JSON');
      return NextResponse.json({ success: false, message: 'Invalid backend response', raw: text }, { status: 500 });
    }
    
    console.log('Backend response data:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Appointments POST proxy error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}