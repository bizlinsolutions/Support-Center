import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchServer } from './lib/fetchServer';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const userCookie = cookieStore.get('user')?.value;

  let user = null;
  try {
    user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
  } catch (e) {
    user = null;
  }

  const role = user?.role || 'user';

  let dashboardData = null;
  if (token) {
    try {
      dashboardData = await fetchServer('/dashboard', { token });
    } catch (e) {
      const err = e as Error & { status?: number };
      console.error('Failed to fetch dashboard data:', err.message);
      // If the token is invalid/expired, redirect to login so the user re-authenticates
      if (err.status === 401) {
        redirect('/login');
      }
      // For other errors (e.g. network issues), fall through and show an empty dashboard
    }
  }

  // Admin view
  if (token && role === 'admin') {
    return (
      <main className="max-w-5xl my-12 mx-auto px-8">
        <AdminDashboard tickets={dashboardData?.tickets || []} users={dashboardData?.users || []} currentUser={user} />
      </main>
    );
  }

  // Regular user view
  return (
    <main className="max-w-5xl my-12 mx-auto px-8">
      <UserDashboard tickets={dashboardData?.tickets || []} user={user} />
    </main>
  );
}