import { authOptions } from './options';
import { getServerSession } from 'next-auth';

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return {
        id: session.user.id,
        email: session.user.email
    };
}