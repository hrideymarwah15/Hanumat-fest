
import { Navbar, Footer } from '@/components/layout'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-12 flex-1">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <div className="prose max-w-none">
          <p className="mb-4">Our refund policy is as follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Event Cancellation:</strong> If the entire event is cancelled by the organizers, 100% of the registration fee will be refunded.</li>
            <li><strong>Sport Cancellation:</strong> If a specific sport is cancelled due to lack of participation (minimum teams not met), full fees will be refunded.</li>
            <li><strong>Participant Withdrawal:</strong> No refunds are provided if a participant withdraws after registration.</li>
            <li><strong>Disqualification:</strong> Disqualified teams/individuals are not eligible for any refund.</li>
          </ul>
          <p className="mt-8 text-muted-foreground">For refund related queries, please contact support@hanumatfest.com</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
