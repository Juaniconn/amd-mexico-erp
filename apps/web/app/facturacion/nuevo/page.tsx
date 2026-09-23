'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Ya no se crean facturas manuales — solo cola CONTPAQi desde embarques. */
export default function FacturacionNuevoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/facturacion');
  }, [router]);
  return null;
}
