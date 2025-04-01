import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { API_CONFIG } from './config';
import { AFIESCAError } from './errors';
import type { SimulationDataMT, SimulationResultMT } from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const builder = new XMLBuilder({
  attributeNamePrefix: "@_",
  ignoreAttributes: false
});

const apiClient = axios.create({
  baseURL: API_CONFIG.WSDL_URL,
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  }
});

/**
 * Creates a new simulation
 */
export async function createSimulation(data: SimulationDataMT): Promise<SimulationResultMT> {
  try {
    const xmlRequest = builder.build({
      'soapenv:Envelope': {
        '@_xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@_xmlns:sim': 'http://www.afi-esca.com/ws/simulation',
        'soapenv:Header': {
          'sim:AuthHeader': {
            'sim:Login': API_CONFIG.AUTH.login,
            'sim:PartnerId': API_CONFIG.AUTH.partnerId
          }
        },
        'soapenv:Body': {
          'sim:CreateSimulationData': {
            'sim:simulationData': data
          }
        }
      }
    });

    const { data: response } = await apiClient.post('', xmlRequest);
    const result = parser.parse(response);
    const simulationResponse = result['soapenv:Envelope']['soapenv:Body']['sim:CreateSimulationDataResponse'];

    if (simulationResponse.ErrorCode) {
      throw new AFIESCAError(
        simulationResponse.ErrorDescription || `AFI ESCA API Error: ${simulationResponse.ErrorCode}`,
        simulationResponse.ErrorCode,
        simulationResponse
      );
    }

    return simulationResponse;
  } catch (error) {
    console.error('Error creating simulation:', error);
    throw new AFIESCAError('Failed to create AFI ESCA simulation');
  }
}

/**
 * Gets simulation results
 */
export async function getSimulationResults(simulationId: string): Promise<SimulationResultMT> {
  try {
    const xmlRequest = builder.build({
      'soapenv:Envelope': {
        '@_xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@_xmlns:sim': 'http://www.afi-esca.com/ws/simulation',
        'soapenv:Header': {
          'sim:AuthHeader': {
            'sim:Login': API_CONFIG.AUTH.login,
            'sim:PartnerId': API_CONFIG.AUTH.partnerId
          }
        },
        'soapenv:Body': {
          'sim:Simulate': {
            'sim:simulationId': simulationId
          }
        }
      }
    });

    const { data: response } = await apiClient.post('', xmlRequest);
    const result = parser.parse(response);
    const simulationResponse = result['soapenv:Envelope']['soapenv:Body']['sim:SimulateResponse'];

    if (simulationResponse.ErrorCode) {
      throw new AFIESCAError(
        simulationResponse.ErrorDescription || `AFI ESCA API Error: ${simulationResponse.ErrorCode}`,
        simulationResponse.ErrorCode,
        simulationResponse
      );
    }

    return simulationResponse;
  } catch (error) {
    console.error('Error getting simulation results:', error);
    throw new AFIESCAError('Failed to get AFI ESCA simulation results');
  }
}

// Add request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    if (import.meta.env.DEV) {
      console.debug('AFI ESCA API Request:', {
        method: config.method,
        url: config.url,
        headers: config.headers
      });
    }
    return config;
  },
  error => {
    console.error('AFI ESCA API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.debug('AFI ESCA API Response:', {
        status: response.status,
        headers: response.headers
      });
    }
    return response;
  },
  error => {
    console.error('AFI ESCA API Response Error:', error);
    return Promise.reject(error);
  }
);