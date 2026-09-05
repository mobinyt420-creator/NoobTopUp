import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5174;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const EMBEDDED_SA_BASE64 = 'ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAibm9vYi10b3B1cC1mOGVlNyIsCiAgInByaXZhdGVfa2V5X2lkIjogIjhkNTExZTVjZDk3MjRkMWZlMzgzMzgyZjM4Njc2MWQyMzk2ZjU5MTIiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2d0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU2xBZ0VBQW9JQkFRRFVDRTNrUjFiZkdsQ3NcbkRmODNZempveXI4UU1mZm5oNzZEVUF5WUltS2dpaStYWTJKZDJPMGdMME5PV0l4SW51MzRhMEJCZjgraDN0a05cbjhjdFNuelJycU5aRXQ5ckRXQ2cwRCs2SXZaQ215bTJMTTV3dDEyRm5LUEQzRDl6ZHpjby9rNThtR29JR283YXlcbmp3SmE4VHBNN2g0TDUzV2NIOHRqcDFKUDg0ZGNSRGU2VUJDUWhrTi9yd0Z0MktmaDR1UzEwdFNsTzk0NVZ3YzRcbnVpOEl3TlNtMjk2UEIrTjAxNm02NGdNNFV1aTRpVE9SeFNPaEMxeWpWZ2piL1VER0FLS0Y0TTlNQzFqL3NVdkxcbmdwYkFvOE1ORnJiQVdjYjN3aXJJMnlvU1VhaUthVUpQME5nYTZmbHhMYno1MHZYR2VJWDNOWmpncTYwQzkrZHFcbjlBN3RpSW1uQWdNQkFBRUNnZ0VBRUFhdXFIM3g1WHdPTStyODZ0bFBrRnplc3lFcnZTN0g2aEh2V2NKamxRSE1cbjFoTDNlT053RE5vMXFxTEx1Nk56bGk2NUZScE5mYzBqdDhlYVdCemJiL1c3ZUVjelBFZWFCbEZiOUs3clU0Z0NcblhwNmdnK0IvSnJaei9DQ1JUNXlCMkd0V2dLRkpTYW92SVhEb3V5bjNmNkFSMmxGODFMZWNmbVJEdHZKUHZWdnhcbllMZGxhRE1IcE04V25xQmVxZFV6YU5PZ3FmZE9RZTRxYzJ3QVFNNnJYU0V5cDU1U3hSYi9lYk56SWFVL3A4RkJcbk05WU1WbkdjekkyakowN29kWTBEcmlsVndMd2ZxR2RHVnVQSUNCK2Ixbmp6VGlwZEZKMUd1ZVU0MjNFQ0xwdzhcbkl6WTRMMmF6bjJ4UDhISUJTbzhhTTY3UVM3VmJDZDBSVVpnRTdFTjRKUUtCZ1FEeXBwbVZUQzdMMW9YQnhwblpcblBBTkc4U00xNXU4djdWUmhGcElVVUd0RmdrV2UxTjBQWGdENEZVRzVrT0FrQTQzeFBnVzVrMEgzYXo3Tm00UHhcbktDWGttOEJRelRTaW8vZEVwNDhNZ1dPamM3YkFuazcvSXdjNTRnWStwbnVRQVd5NVpkMEFIWWF2WnBMaEJUUWpcbmU0bm9YM2Q4Z1JhbTVMdDFBa0JNQ0RWVlF3S0JnUURmc256R0VkcGJVb0d0aW9MdTR0MFk1VjlCMTdPL0RoblZcbmQrVzJLTkkwT0tMRVRDcU16TjZzMnpKc1lPa1RYVnlUYjJqa1ZLUzNKbkh5TkQrTFNMWkU2ODVHVUtTQ21VZ2pcbkYxWERXKzBNZjdueTdEdmRUaS9uRERNUmxEU3cyNHp4aTBmdTlLSkN4aHNJeG5KV2lrV3ZHUVZhaTBVd3Zra1pcbmFCY2tiYW9CelFLQmdRQ2xVUkFPQVl0WVlOMWNPZHlUZmltVmFiQmRodXFxc256c2NKNHhyT0NJeU1wNS9maG1cbkFkdVRLWmhQdnY2V1NyMm9BR09TSFZ1eUg2VDRHOTMyclMyejVORlB1NThDdDhjOVJSTldwOGlra2ErTzU4eFdcblV4MFhPSUNjcW54QWpsZnVzQkd6aEdwQWtoZTdxdm5zdXJ3b1R2SnZKdHV4OU9BcVJkQmNmTE1wVlFLQmdRQzNcbjVROVY5UTlBeTg3M1QwcmIvM3dySDBUejU5TklXTnM3OWRqTnF6bEMzTnhSNnh0L3JGdlNWbEJaY0VHclBiRUJcbk16RlRvNUhWVHJHVm53WXVCcFJ3akRtQzdJQ1JMRmwxSDVYTmlDQ1RpZHpmcXZ4N3JlOExUYWdkNTJ4NWg4T1NcblBpSGdleE41T1VxNEtBdU93UlVRSU0yWjVhdjNxamFGd0dCbC9oRW9jUUtCZ1FDNUtWcnFTNE1TWHZteU5yVi9cbnQvR2xRdXFJdWJYSE1oM0FaVldCd1RxaHgvUGs2aVNiODZzbnVkMXYzTmk3bFNRZVRUcW9YeFN3RU55T05hRHpcbm9tZWtZdU4vdGVnQlFDMjc1dnNJaTNHWW5kZVhmSWFBNFFvdTZJQVFsT3FuOTlySEdrOGFCNEd5dFVkYUxDckxcbjlwUWxiZS9xNlBFSVNVNkVxSG05SHhQTUhnPT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsCiAgImNsaWVudF9lbWFpbCI6ICJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0Bub29iLXRvcHVwLWY4ZWU3LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAiY2xpZW50X2lkIjogIjEwNDg5NzUyOTAzNDM2NzA0MDAxOSIsCiAgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwKICAidG9rZW5fdXJpIjogImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwKICAiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS9jZXJ0cyIsCiAgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvZmlyZWJhc2UtYWRtaW5zZGstZmJzdmMlNDBub29iLXRvcHVwLWY4ZWU3LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAidW5pdmVyc2VfZG9tYWluIjogImdvb2dsZWFwaXMuY29tIgp9Cg==';

function getLocalServiceAccount() {
  const saPath = path.join(__dirname, 'service-account.json');
  if (fs.existsSync(saPath)) {
    try {
      return JSON.parse(fs.readFileSync(saPath, 'utf8'));
    } catch (e) {
      // fallback
    }
  }
  try {
    return JSON.parse(Buffer.from(EMBEDDED_SA_BASE64, 'base64').toString('utf8'));
  } catch (e) {
    return null;
  }
}

async function getGoogleAccessToken(clientEmail, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
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

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle FCM Dispatch API
  if (req.url.startsWith('/api/send-fcm') && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        const { title, body, url, image, serviceAccount } = JSON.parse(bodyData || '{}');
        if (!title || !body) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Title and Body are required' }));
          return;
        }

        let sa = null;
        if (serviceAccount) {
          if (typeof serviceAccount === 'string') {
            try { sa = JSON.parse(serviceAccount); } catch (e) { sa = null; }
          } else if (typeof serviceAccount === 'object') {
            sa = serviceAccount;
          }
        }

        if (!sa || !sa.client_email) {
          sa = getLocalServiceAccount();
        }

        if (!sa || !sa.client_email || !sa.private_key) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Firebase Service Account credentials required.' }));
          return;
        }

        const projectId = sa.project_id || 'noob-topup-f8ee7';
        const accessToken = await getGoogleAccessToken(sa.client_email, sa.private_key);

        const v1Payload = {
          message: {
            topic: 'all_users',
            notification: { title, body },
            data: { title, body, url: url || 'https://noobtopup.com/' },
            android: { priority: 'high', notification: { sound: 'default' } }
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + reqPath);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Noob Topup Admin Console is running!`);
  console.log(`Local Access:  http://localhost:${PORT}/`);
});
