import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { MOCK_FLIGHTS } from '@/lib/api';

export async function generateStaticParams() {
  const paramsFromMock = MOCK_FLIGHTS.map((f) => ({ flightId: String(f.id) }));
  const customIds = [
    'f-dom-1', 'f-dom-2', 'f-dom-3', 'f-dom-4', 'f-dom-5', 'f-dom-6', 'f-dom-7', 'f-dom-8', 'f-dom-9', 'f-dom-10',
    'f-dom-11', 'f-dom-12', 'f-dom-13', 'f-dom-14', 'f-dom-15',
    '11111111-1111-1111-1111-111111111111', '11111111-2222-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222', '22222222-3333-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
    'f-int-7', 'f-int-8', 'f-int-9', 'f-int-10', 'f-int-11', 'f-int-12', 'f-int-13', 'f-int-14', 'f-int-15',
    'flight-1', 'flight-2', 'flight-3', 'default', 'sample'
  ].map((id) => ({ flightId: id }));

  const all = [...paramsFromMock, ...customIds];
  const unique = Array.from(new Set(all.map((p) => p.flightId))).map((id) => ({ flightId: id }));
  return unique;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
