const express = require('express');
const path = require('path');
const app = express();

// ===== CORS =====
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== DATA =====
let forms = [
  { id: '1', name: 'Leads Interior', accessKey: '116d49db_b6a3', website: 'localhost:5500', created: '2026-10-07', submissions: 3, status: 'Active', notifyEmail: 'md.alikhan42@gmail.com' },
  { id: '2', name: 'Arfina Website', accessKey: 'v8rsjavu_rvmc', website: 'localhost:8000', created: '2026-10-06', submissions: 5, status: 'Active', notifyEmail: 'md.alikhan42@gmail.com' },
  { id: '3', name: 'Modular Kitchen', accessKey: 'kitchen_2024_x', website: 'kitchen.com', created: '2026-10-05', submissions: 2, status: 'Paused', notifyEmail: 'md.alikhan42@gmail.com' }
];

let leads = [
  { id: '1', formId: '1', name: 'Mack John', email: 'md.alikhan42@gmail.com', phone: '8910171085', message: 'Need interior design', source: 'Forms', isValidEmail: true, isValidPhone: true, waStatus: 'Pending', emailStatus: 'Pending', waDelivered: false, waRead: false, waReplied: false, emailOpened: false, emailClicked: false, emailReplied: false, tags: ['hot'], createdAt: '2026-10-07' },
  { id: '2', formId: '1', name: 'Amit Sharma', email: 'amit@gmail.com', phone: '9876543210', message: 'Interested', source: 'Forms', isValidEmail: true, isValidPhone: true, waStatus: 'Sent', emailStatus: 'Sent', waDelivered: true, waRead: true, waReplied: false, emailOpened: true, emailClicked: false, emailReplied: true, tags: ['warm'], createdAt: '2026-10-06' },
  { id: '3', formId: '2', name: 'Riya Verma', email: 'riya@yahoo.com', phone: '12345', message: 'Call me', source: 'WhatsApp', isValidEmail: true, isValidPhone: false, waStatus: 'Pending', emailStatus: 'Pending', waDelivered: false, waRead: false, waReplied: false, emailOpened: false, emailClicked: false, emailReplied: false, tags: [], createdAt: '2026-10-06' },
  { id: '4', formId: '2', name: 'Rahul Kumar', email: 'rahul@outlook.com', phone: '7894561230', message: '3BHK', source: 'Telegram', isValidEmail: true, isValidPhone: true, waStatus: 'Sent', emailStatus: 'Sent', waDelivered: true, waRead: false, waReplied: false, emailOpened: true, emailClicked: true, emailReplied: false, tags: ['hot'], createdAt: '2026-10-05' },
  { id: '5', formId: '3', name: 'Priya Singh', email: 'priya@gmail.com', phone: '9123456780', message: 'Modular kitchen', source: 'Facebook', isValidEmail: true, isValidPhone: true, waStatus: 'Sent', emailStatus: 'Sent', waDelivered: true, waRead: true, waReplied: true, emailOpened: true, emailClicked: true, emailReplied: true, tags: ['converted'], createdAt: '2026-10-04' },
  { id: '6', formId: '3', name: 'Test Invalid', email: 'wrongemail', phone: '123', message: 'spam', source: 'Forms', isValidEmail: false, isValidPhone: false, waStatus: 'Pending', emailStatus: 'Pending', waDelivered: false, waRead: false, waReplied: false, emailOpened: false, emailClicked: false, emailReplied: false, tags: [], createdAt: '2026-10-04' }
];

let integrations = [
  { id: '1', name: 'Google Sheets', desc: 'Sync form submissions', icon: '📊', connected: false },
  { id: '2', name: 'Telegram', desc: 'Get notifications', icon: '✈️', connected: false },
  { id: '3', name: 'Slack', desc: 'Notifications in Slack', icon: '💬', connected: false },
  { id: '4', name: 'Discord', desc: 'Notifications in Discord', icon: '🎮', connected: false },
  { id: '5', name: 'Webhook', desc: 'Send data to any URL', icon: '🔗', connected: false },
  { id: '6', name: 'Notion', desc: 'Sync to Notion', icon: '📝', connected: false },
  { id: '7', name: 'Zapier', desc: 'Connect 5000+ apps', icon: '⚡', connected: false },
  { id: '8', name: 'Email', desc: 'Email notifications', icon: '📧', connected: true }
];

let waNumbers = [
  { id: '1', number: '8910171085', name: 'Mack John', addedAt: '2026-10-07' },
  { id: '2', number: '9876543210', name: 'Amit Sharma', addedAt: '2026-10-06' },
  { id: '3', number: '7894561230', name: 'Rahul Kumar', addedAt: '2026-10-05' }
];

let emailContacts = [
  { id: '1', email: 'md.alikhan42@gmail.com', name: 'Mack John', company: 'Arfina Design' },
  { id: '2', email: 'amit@gmail.com', name: 'Amit Sharma', company: 'Tech Solutions' },
  { id: '3', email: 'rahul@outlook.com', name: 'Rahul Kumar', company: 'Interior Hub' },
  { id: '4', email: 'priya@gmail.com', name: 'Priya Singh', company: 'Kitchen World' }
];

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }
function validatePhone(p) { return /^[6-9]\d{9}$/.test(p || ''); }

// ===== SSE (Real-time) =====
let sseClients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  
  sseClients.push(res);
  
  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

function notifyClients(data) {
  sseClients.forEach(client => {
    try {
      client.write('data: ' + JSON.stringify(data) + '\n\n');
    } catch(e) {}
  });
}

// ===== API ROUTES =====
app.get('/api/forms', (req, res) => res.json(forms));
app.get('/api/leads', (req, res) => res.json(leads));
app.get('/api/integrations', (req, res) => res.json(integrations));
app.get('/api/wa-numbers', (req, res) => res.json(waNumbers));
app.get('/api/email-contacts', (req, res) => res.json(emailContacts));

app.post('/api/forms', (req, res) => {
  const key = Math.random().toString(36).substring(2, 10) + '_' + Math.random().toString(36).substring(2, 6);
  const newForm = {
    id: Date.now().toString(),
    name: req.body.name || 'Untitled',
    accessKey: key,
    website: req.body.website || '',
    notifyEmail: req.body.notifyEmail || '',
    created: new Date().toISOString().split('T')[0],
    submissions: 0,
    status: 'Active'
  };
  forms.push(newForm);
  res.json(newForm);
});

app.delete('/api/leads/:id', (req, res) => {
  leads = leads.filter(l => l.id !== req.params.id);
  res.json({ success: true });
});

app.delete('/api/leads', (req, res) => {
  leads = [];
  res.json({ success: true });
});

// ===== WEBHOOK - Form Submit =====
app.post('/api/webhook/:key', (req, res) => {
  const form = forms.find(f => f.accessKey === req.params.key);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  
  const newLead = {
    id: Date.now().toString(),
    formId: form.id,
    name: req.body.name || 'Unknown',
    email: req.body.email || '',
    phone: req.body.phone || '',
    message: req.body.message || '',
    source: 'Forms',
    isValidEmail: validateEmail(req.body.email),
    isValidPhone: validatePhone(req.body.phone),
    waStatus: 'Pending', emailStatus: 'Pending',
    waDelivered: false, waRead: false, waReplied: false,
    emailOpened: false, emailClicked: false, emailReplied: false,
    tags: [], createdAt: new Date().toISOString().split('T')[0]
  };
  
  leads.push(newLead);
  form.submissions += 1;
  
  // ✅ Notify all dashboards instantly
  notifyClients({ type: 'new-lead', lead: newLead });
  
  res.json({ success: true, lead: newLead });
});

app.post('/api/leads/bulk-send', (req, res) => {
  const leadIds = req.body.leadIds || [];
  const type = req.body.type;
  leadIds.forEach(id => {
    const l = leads.find(x => x.id === id);
    if (!l) return;
    if (type === 'whatsapp' && l.isValidPhone) { l.waStatus = 'Sent'; l.waDelivered = true; }
    if (type === 'email' && l.isValidEmail) { l.emailStatus = 'Sent'; }
  });
  res.json({ success: true });
});

app.post('/api/integrations/:id/toggle', (req, res) => {
  const i = integrations.find(x => x.id === req.params.id);
  if (!i) return res.status(404).json({ error: 'Not found' });
  i.connected = !i.connected;
  res.json(i);
});

app.post('/api/wa-numbers', (req, res) => {
  const n = {
    id: Date.now().toString(),
    number: req.body.number || '',
    name: req.body.name || 'Unknown',
    addedAt: new Date().toISOString().split('T')[0]
  };
  waNumbers.push(n);
  res.json(n);
});

app.post('/api/wa-numbers/bulk', (req, res) => {
  const list = req.body.list || [];
  let added = 0;
  list.forEach(item => {
    if (item.number && item.number.length === 10) {
      waNumbers.push({
        id: (Date.now() + Math.random()).toString(),
        number: item.number,
        name: item.name || 'Unknown',
        addedAt: new Date().toISOString().split('T')[0]
      });
      added++;
    }
  });
  res.json({ success: true, added });
});

app.delete('/api/wa-numbers/:id', (req, res) => {
  waNumbers = waNumbers.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/wa-send', (req, res) => {
  const message = req.body.message || '';
  if (!message) return res.status(400).json({ error: 'Message required' });
  if (waNumbers.length === 0) return res.status(400).json({ error: 'No numbers' });
  waNumbers.forEach(w => {
    const l = leads.find(x => x.phone === w.number);
    if (l) { l.waStatus = 'Sent'; l.waDelivered = true; }
  });
  res.json({ success: true, sent: waNumbers.length });
});

app.post('/api/email-contacts', (req, res) => {
  const c = {
    id: Date.now().toString(),
    email: req.body.email || '',
    name: req.body.name || 'Unknown',
    company: req.body.company || '-'
  };
  emailContacts.push(c);
  res.json(c);
});

app.post('/api/email-contacts/bulk', (req, res) => {
  const list = req.body.list || [];
  let added = 0;
  list.forEach(item => {
    if (item.email && item.email.indexOf('@') > -1) {
      emailContacts.push({
        id: (Date.now() + Math.random()).toString(),
        email: item.email,
        name: item.name || 'Unknown',
        company: item.company || '-'
      });
      added++;
    }
  });
  res.json({ success: true, added });
});

app.delete('/api/email-contacts/:id', (req, res) => {
  emailContacts = emailContacts.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/email-send', (req, res) => {
  const to = req.body.to || [];
  const subject = req.body.subject || '';
  if (!subject) return res.status(400).json({ error: 'Subject required' });
  if (to.length === 0) return res.status(400).json({ error: 'No recipients' });
  to.forEach(email => {
    const l = leads.find(x => x.email === email);
    if (l) l.emailStatus = 'Sent';
  });
  res.json({ success: true, sent: to.length });
});

// ===== FRONTEND =====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));

// ===== START =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  🚀 Leadkite is RUNNING!');
  console.log('========================================');
  console.log('');
  console.log('  👉 http://localhost:3000');
  console.log('');
});