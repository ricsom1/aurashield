import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { type, value } = await request.json();
    
    // Validate input
    if (!type || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type !== 'reddit' && type !== 'keyword') {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // Check if entity already exists for this user
    const { data: existingEntity } = await supabase
      .from('tracked_entities')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('value', value)
      .single();

    if (existingEntity) {
      return NextResponse.json({ 
        error: 'Entity is already being tracked',
        entity: existingEntity
      }, { status: 409 });
    }

    // Insert new tracked entity
    const { data: entity, error: insertError } = await supabase
      .from('tracked_entities')
      .insert([
        {
          user_id: user.id,
          type,
          value
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error tracking entity:', insertError);
      return NextResponse.json({ error: 'Failed to track entity' }, { status: 500 });
    }

    const jsonResponse = NextResponse.json({ entity });

    // Set any necessary cookies on the response
    jsonResponse.cookies.set('last_tracked_entity', entity.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return jsonResponse;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 