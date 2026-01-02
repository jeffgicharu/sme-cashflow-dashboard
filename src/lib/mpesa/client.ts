/**
 * M-Pesa Daraja API Client
 *
 * This client handles communication with Safaricom's Daraja API for M-Pesa integration.
 * Supports sandbox and production environments.
 *
 * Environment variables required:
 * - MPESA_CONSUMER_KEY: Your Daraja API consumer key
 * - MPESA_CONSUMER_SECRET: Your Daraja API consumer secret
 * - MPESA_SHORTCODE: Your business shortcode (Till number)
 * - MPESA_PASSKEY: Your Lipa Na M-Pesa Online passkey
 * - MPESA_ENVIRONMENT: 'sandbox' or 'production'
 * - MPESA_CALLBACK_URL: Your webhook URL for receiving callbacks
 */

interface OAuthToken {
  access_token: string;
  expires_in: string;
  expiresAt: number;
}

interface C2BRegisterResponse {
  OriginatorCoversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

interface C2BCallbackData {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

// Cache for OAuth token
let cachedToken: OAuthToken | null = null;

const DARAJA_URLS = {
  sandbox: {
    oauth:
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    c2bRegister: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
    c2bSimulate: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate',
  },
  production: {
    oauth:
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    c2bRegister: 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl',
    c2bSimulate: '', // Not available in production
  },
};

function getConfig() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const environment = (process.env.MPESA_ENVIRONMENT || 'sandbox') as
    | 'sandbox'
    | 'production';
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    environment,
    callbackUrl,
    urls: DARAJA_URLS[environment],
  };
}

/**
 * Check if M-Pesa is configured
 */
export function isMpesaConfigured(): boolean {
  const config = getConfig();
  return !!(config.consumerKey && config.consumerSecret && config.shortcode);
}

/**
 * Get OAuth access token from Daraja API
 * Caches the token and refreshes when expired
 */
export async function getAccessToken(): Promise<string> {
  const config = getConfig();

  if (!config.consumerKey || !config.consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }

  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.access_token;
  }

  // Generate new token
  const credentials = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString('base64');

  const response = await fetch(config.urls.oauth, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get M-Pesa access token: ${error}`);
  }

  const data = await response.json();

  // Cache the token with expiry buffer (subtract 60 seconds)
  cachedToken = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    expiresAt: Date.now() + (parseInt(data.expires_in) - 60) * 1000,
  };

  return cachedToken.access_token;
}

/**
 * Register C2B URLs with M-Pesa
 * This tells M-Pesa where to send payment confirmations
 */
export async function registerC2BUrls(
  confirmationUrl: string,
  validationUrl: string
): Promise<C2BRegisterResponse> {
  const config = getConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(config.urls.c2bRegister, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: config.shortcode,
      ResponseType: 'Completed',
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to register C2B URLs: ${error}`);
  }

  return response.json();
}

/**
 * Simulate a C2B payment (sandbox only)
 * Used for testing the integration without real money
 */
export async function simulateC2BPayment(
  amount: number,
  phoneNumber: string,
  billRefNumber: string
): Promise<{ success: boolean; message: string }> {
  const config = getConfig();

  if (config.environment !== 'sandbox') {
    throw new Error('C2B simulation is only available in sandbox environment');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(config.urls.c2bSimulate, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: config.shortcode,
      CommandID: 'CustomerPayBillOnline',
      Amount: amount,
      Msisdn: phoneNumber,
      BillRefNumber: billRefNumber,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, message: `Simulation failed: ${error}` };
  }

  const data = await response.json();
  return {
    success: data.ResponseCode === '0',
    message: data.ResponseDescription,
  };
}

/**
 * Parse C2B callback data from M-Pesa
 */
export function parseC2BCallback(body: C2BCallbackData) {
  // Parse the transaction time (format: YYYYMMDDHHmmss)
  const timeStr = body.TransTime;
  const date = new Date(
    parseInt(timeStr.substring(0, 4)),
    parseInt(timeStr.substring(4, 6)) - 1,
    parseInt(timeStr.substring(6, 8)),
    parseInt(timeStr.substring(8, 10)),
    parseInt(timeStr.substring(10, 12)),
    parseInt(timeStr.substring(12, 14))
  );

  // Format sender name
  const senderName = [body.FirstName, body.MiddleName, body.LastName]
    .filter(Boolean)
    .join(' ');

  // Format phone number (remove country code prefix if present)
  let phone = body.MSISDN;
  if (phone.startsWith('254')) {
    phone = '0' + phone.substring(3);
  }

  return {
    transactionId: body.TransID,
    amount: parseInt(body.TransAmount),
    date,
    senderPhone: phone,
    senderName: senderName || undefined,
    reference: body.BillRefNumber || undefined,
    shortcode: body.BusinessShortCode,
    transactionType: body.TransactionType,
  };
}

/**
 * Validate that a callback is from M-Pesa
 * In production, you should verify the request signature
 */
export function validateCallback(headers: Headers): boolean {
  // In a production environment, you would validate:
  // 1. The request comes from Safaricom's IP range
  // 2. The request signature is valid
  // For sandbox/demo purposes, we'll do basic validation

  const contentType = headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

export type { C2BCallbackData };
