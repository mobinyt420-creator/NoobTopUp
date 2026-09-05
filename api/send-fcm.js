export default async function handler(req, res) {
  // Set CORS headers
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
    const { title, body, url, image, serverKey } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and Body are required' });
    }

    if (!serverKey) {
      return res.status(400).json({ 
        error: 'Firebase Server Key is required. Get it from Firebase Console -> Project Settings -> Cloud Messaging -> Server key.' 
      });
    }

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

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
