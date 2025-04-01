import { http, HttpResponse } from 'msw';
import { API_CONFIG } from '../../soap/config';

export const handlers = [
  http.post(`${API_CONFIG.WSDL_URL}/simulate`, async ({ request }) => {
    const xml = await request.text();
    
    // Check for simulation data
    if (!xml.includes('SimulationData')) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.xml(`
      <soapenv:Envelope>
        <soapenv:Body>
          <sim:SimulateResponse>
            <SimulationId>test-123</SimulationId>
            <Primes>
              <Prime>
                <Garantie>DC</Garantie>
                <Montant>50.00</Montant>
              </Prime>
            </Primes>
            <TotalPrimes>12000.00</TotalPrimes>
          </sim:SimulateResponse>
        </soapenv:Body>
      </soapenv:Envelope>
    `);
  }),

  http.post(`${API_CONFIG.WSDL_URL}/saveDossier`, async () => {
    return HttpResponse.xml(`
      <soapenv:Envelope>
        <soapenv:Body>
          <sim:SaveDossierResponse>
            <URL>https://subscription.afi-esca.com/test-123</URL>
          </sim:SaveDossierResponse>
        </soapenv:Body>
      </soapenv:Envelope>
    `);
  })
];