import Image from "next/image";
import Link from "next/link"

export default function Home() {
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome to the support center. 
        Browse open tickets, submit new requests, or check on the status of your recent issues — all in one place.</p>
      <br />
      <div className="flex justify-center-safe">
        <Link href="/tickets">
          <button className="btn-primary">View Tickets</button>
        </Link>
      </div>


      <h1>Updates</h1>

      <div className="card">
        <h3>Scheduled Maintenance – June 3, 2026</h3>
        <p>Our systems will undergo routine maintenance on June 3rd from 2:00 AM to 4:00 AM IST. During this window, 
          ticket submissions and login may be temporarily unavailable. All existing data will remain intact. We recommend 
          submitting any urgent requests before the maintenance window begins.</p>
      </div>
      <div className="card">
        <h3>New: Priority Ticket Tagging</h3>
        <p>You can now tag tickets as Low, Medium, or High priority when submitting a request. This helps our support team 
          triage issues faster and ensures critical problems get routed to the right agents immediately. Look for the 
          priority selector on the new ticket form.</p>
      </div>
      <div className="card">
        <h3>Response Time Update</h3>
        <p>Due to increased volume, first-response times for general inquiries may be up to 24 hours. Priority and 
          billing-related tickets will continue to receive responses within 4 hours. We appreciate your patience and are 
          actively expanding our support team to meet demand.</p>
      </div>
    </main>
    
  );
}
