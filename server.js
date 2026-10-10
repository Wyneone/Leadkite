const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });
app.use('/uploads', express.static(uploadsDir));

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

let waCampaigns = [];
let connectedIntegrations = {
  googleSheets: { connected: false, url: '' },
  whatsapp: { connected: false, number: '' }
};
let userProfile = {
  name: 'Azmat Khan',
  email: 'md.alikhan42@gmail.com',
  image: ''
};

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }
function validatePhone(p) { return /^[6-9]\d{9}$/.test(p || ''); }

let sseClients = [];
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  sseClients.push(res);
  req.on('close', () => { sseClients = sseClients.filter(c => c !== res); });
});
function notifyClients(data) {
  sseClients.forEach(client => {
    try { client.write('data: ' + JSON.stringify(data) + '\n\n'); } catch (e) {}
  });
}

app.get('/api/forms', (req, res) => res.json(forms));
app.get('/api/leads', (req, res) => res.json(leads));
app.get('/api/integrations', (req, res) => res.json(integrations));
app.get('/api/wa-numbers', (req, res) => res.json(waNumbers));
app.get('/api/email-contacts', (req, res) => res.json(emailContacts));
app.get('/api/wa-campaigns', (req, res) => res.json(waCampaigns));
app.get('/api/integrations/status', (req, res) => res.json(connectedIntegrations));
app.get('/api/profile', (req, res) => res.json(userProfile));

app.get('/api/chart-data', (req, res) => {
  var days = [];
  var counts = [];
  var now = new Date();
  for (var i = 6; i >= 0; i--) {
    var d = new Date(now);
    d.setDate(d.getDate() - i);
    var dateStr = d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    var count = leads.filter(function(l) { return l.createdAt === dateStr; }).length;
    counts.push(count);
  }
  var sources = {};
  leads.forEach(function(l) {
    sources[l.source] = (sources[l.source] || 0) + 1;
  });
  res.json({
    leadsOverTime: { labels: days, data: counts },
    sources: { labels: Object.keys(sources), data: Object.values(sources) }
  });
});

app.post('/api/profile', (req, res) => {
  if (req.body.name) userProfile.name = req.body.name;
  if (req.body.email) userProfile.email = req.body.email;
  if (req.body.image !== undefined) userProfile.image = req.body.image;
  res.json(userProfile);
});

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

app.put('/api/forms/:id', (req, res) => {
  const f = forms.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'Form not found' });
  if (req.body.name) f.name = req.body.name;
  if (req.body.website !== undefined) f.website = req.body.website;
  if (req.body.notifyEmail !== undefined) f.notifyEmail = req.body.notifyEmail;
  if (req.body.status) f.status = req.body.status;
  res.json(f);
});

app.delete('/api/forms/:id', (req, res) => {
  forms = forms.filter(f => f.id !== req.params.id);
  res.json({ success: true });
});

app.delete('/api/leads/:id', (req, res) => {
  leads = leads.filter(l => l.id !== req.params.id);
  res.json({ success: true });
});

app.delete('/api/leads', (req, res) => {
  leads = [];
  res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: '/uploads/' + req.file.filename, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
});

app.get('/api/leads/export', (req, res) => {
  res.json({ exportedAt: new Date().toISOString(), totalLeads: leads.length, leads: leads });
});

app.post('/api/leads/import', (req, res) => {
  const imported = req.body.leads || [];
  if (!Array.isArray(imported)) return res.status(400).json({ error: 'Invalid data' });
  let added = 0;
  imported.forEach(item => {
    if (item.name && (item.email || item.phone)) {
      leads.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        formId: item.formId || 'imported',
        name: item.name, email: item.email || '', phone: item.phone || '', message: item.message || '',
        source: item.source || 'Imported',
        isValidEmail: validateEmail(item.email), isValidPhone: validatePhone(item.phone),
        waStatus: 'Pending', emailStatus: 'Pending',
        waDelivered: false, waRead: false, waReplied: false,
        emailOpened: false, emailClicked: false, emailReplied: false,
        tags: item.tags || [], createdAt: item.createdAt || new Date().toISOString().split('T')[0]
      });
      added++;
    }
  });
  notifyClients({ type: 'refresh-all' });
  res.json({ success: true, added: added });
});

app.post('/api/integrations/google-sheets/connect', (req, res) => {
  const url = req.body.sheetUrl || '';
  if (!url) return res.status(400).json({ error: 'Sheet URL required' });
  connectedIntegrations.googleSheets = { connected: true, url: url };
  res.json({ success: true });
});

app.post('/api/integrations/google-sheets/disconnect', (req, res) => {
  connectedIntegrations.googleSheets = { connected: false, url: '' };
  res.json({ success: true });
});

app.post('/api/integrations/whatsapp/connect', (req, res) => {
  const num = req.body.number || '';
  if (!num) return res.status(400).json({ error: 'Number required' });
  connectedIntegrations.whatsapp = { connected: true, number: num };
  res.json({ success: true });
});

app.post('/api/integrations/whatsapp/disconnect', (req, res) => {
  connectedIntegrations.whatsapp = { connected: false, number: '' };
  res.json({ success: true });
});

app.post('/api/webhook/:key', (req, res) => {
  const form = forms.find(f => f.accessKey === req.params.key);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  const newLead = {
    id: Date.now().toString(), formId: form.id,
    name: req.body.name || 'Unknown', email: req.body.email || '', phone: req.body.phone || '', message: req.body.message || '',
    source: 'Forms',
    isValidEmail: validateEmail(req.body.email), isValidPhone: validatePhone(req.body.phone),
    waStatus: 'Pending', emailStatus: 'Pending',
    waDelivered: false, waRead: false, waReplied: false,
    emailOpened: false, emailClicked: false, emailReplied: false,
    tags: [], createdAt: new Date().toISOString().split('T')[0]
  };
  leads.push(newLead);
  form.submissions += 1;
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
  const n = { id: Date.now().toString(), number: req.body.number || '', name: req.body.name || 'Unknown', addedAt: new Date().toISOString().split('T')[0] };
  waNumbers.push(n);
  res.json(n);
});

app.post('/api/wa-numbers/bulk', (req, res) => {
  const list = req.body.list || [];
  let added = 0;
  list.forEach(item => {
    if (item.number && item.number.length === 10) {
      waNumbers.push({ id: (Date.now() + Math.random()).toString(), number: item.number, name: item.name || 'Unknown', addedAt: new Date().toISOString().split('T')[0] });
      added++;
    }
  });
  res.json({ success: true, added });
});

app.delete('/api/wa-numbers/:id', (req, res) => {
  waNumbers = waNumbers.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/wa-campaign', (req, res) => {
  const campaign = {
    id: Date.now().toString(),
    name: req.body.name || 'Untitled',
    message: req.body.message || '',
    media: req.body.media || null,
    mediaType: req.body.mediaType || null,
    recipients: req.body.recipients || [],
    createdAt: new Date().toISOString()
  };
  waCampaigns.push(campaign);
  res.json({ success: true, campaign: campaign });
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
  const c = { id: Date.now().toString(), email: req.body.email || '', name: req.body.name || 'Unknown', company: req.body.company || '-' };
  emailContacts.push(c);
  res.json(c);
});

app.post('/api/email-contacts/bulk', (req, res) => {
  const list = req.body.list || [];
  let added = 0;
  list.forEach(item => {
    if (item.email && item.email.indexOf('@') > -1) {
      emailContacts.push({ id: (Date.now() + Math.random()).toString(), email: item.email, name: item.name || 'Unknown', company: item.company || '-' });
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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  🚀 Leadkite is RUNNING!');
  console.log('========================================');
  console.log('');
  console.log('  👉 http://localhost:' + PORT);
  console.log('');
});
