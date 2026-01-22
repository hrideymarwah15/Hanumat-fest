
import { Navbar, Footer } from '@/components/layout'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-12 flex-1">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        <div className="prose max-w-none">
          <p className="mb-4">Welcome to Hanumat Fest. By registering, you agree to the following terms:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Participants must be bonafide students of a recognized university.</li>
            <li>Valid ID cards must be presented at the venue.</li>
            <li>Registration fees are non-refundable generally (see Refund Policy).</li>
            <li>The organizing committee reserves the right to cancel any event or disqualify any participant for misconduct.</li>
            <li>Participants are responsible for their own safety and belongings.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}
