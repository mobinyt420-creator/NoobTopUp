import crypto from 'crypto';

/**
 * Generates an OAuth2 access token for Google Cloud using Service Account credentials.
 */
async function getGoogleAccessToken(clientEmail, privateKey) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Claim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, 'base64url');

  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Failed to get Google access token: ' + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, body, url, image, serviceAccount, serverKey } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and Body are required' });
    }

    // 1. Modern Firebase Cloud Messaging HTTP v1 using Service Account JSON
    let sa = null;
    if (serviceAccount) {
      if (typeof serviceAccount === 'string') {
        try {
          sa = JSON.parse(serviceAccount);
        } catch (e) {
          sa = null;
        }
      } else if (typeof serviceAccount === 'object') {
        sa = serviceAccount;
      }
    }

    if (sa && sa.client_email && sa.private_key) {
      const projectId = sa.project_id || 'noob-topup-f8ee7';
      const accessToken = await getGoogleAccessToken(sa.client_email, sa.private_key);

      const v1Payload = {
        message: {
          topic: 'all_users',
          notification: {
            title: title,
            body: body
          },
          data: {
            title: title,
            body: body,
            url: url || 'https://noobtopup.com/'
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default'
            }
          }
        }
      };

      if (image) {
        v1Payload.message.notification.image = image;
        v1Payload.message.data.image = image;
      }

      const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(v1Payload)
      });

      const result = await fcmRes.json();
      return res.status(200).json(result);
    }

    // 2. Legacy Server Key Fallback
    if (serverKey) {
      const payload = {
        to: '/topics/all_users',
        priority: 'high',
        notification: {
          title: title,
          body: body,
          sound: 'default'
        },
        data: {
          title: title,
          body: body,
          url: url || 'https://noobtopup.com/'
        }
      };

      if (image) {
        payload.notification.image = image;
        payload.data.image = image;
      }

      const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=' + serverKey.trim()
        },
        body: JSON.stringify(payload)
      });

      const result = await fcmResponse.json();
      return res.status(200).json(result);
    }

    return res.status(400).json({ 
      error: 'Firebase Service Account JSON is required. Get it from Firebase Console -> Project Settings -> Service accounts -> Generate new private key.' 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
