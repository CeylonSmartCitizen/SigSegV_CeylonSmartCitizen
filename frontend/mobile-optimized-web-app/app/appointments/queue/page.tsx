// Simple redirect from /appointments/queue to /queue for backward compatibility or navigation
import { redirect } from 'next/navigation';

export default function AppointmentsQueueRedirect() {
  redirect('/queue');
  return null;
}
