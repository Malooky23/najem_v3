import { NextResponse } from 'next/server';
import { copyUsers } from '@/scripts/copyUsers';
import { auth } from '@/lib/auth/auth';
import { copyCustomers } from '@/scripts/copyCustomers';

export async function POST() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await copyCustomers();
        return NextResponse.json({ message: 'Users copied successfully' });
    } catch (error) {
        console.error('Error copying users:', error);
        return NextResponse.json({ error: 'Failed to copy users' }, { status: 500 });
    }
}
