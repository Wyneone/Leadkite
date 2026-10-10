var allForms = [];
var allLeads = [];
var allIntegrations = [];
var allWa = [];
var allEmails = [];
var emailRecipients = [];
var chartsInitialized = false;
var leadsChartInstance = null;
var sourceChartInstance = null;
var waMediaUrl = null;
var waMediaType = null;
var importedLeadsData = [];
var currentFormId = null;
var renamingFormId = null;

function showPage(p) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.add('hidden');
  var target = document.getElementById('page-' + p);
  if (target) target.classList.remove('hidden');
  var navs = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navs.length; j++) navs[j].classList.remove('bg-blue-50', 'text-blue-600');
  var activeNav = document.querySelector('[data-page="' + p + '"]');
  if (activeNav) activeNav.classList.add('bg-blue-50', 'text-blue-600');
  if (p === 'dashboard') renderDashboard();
  if (p === 'forms') renderForms();
  if (p === 'leads') renderLeads();
  if (p === 'campaigns') { showCampTab('whatsapp'); renderCampaigns(); }
  if (p === 'tracking') showTrackTab('whatsapp');
  if (p === 'integrations') renderIntegrations();
}

function loadAll() {
  return Promise.all([
    fetch('/api/forms').then(function (r) { return r.json(); }),
    fetch('/api/leads').then(function (r) { return r.json(); }),
    fetch('/api/integrations').then(function (r) { return r.json(); }),
    fetch('/api/wa-numbers').then(function (r) { return r.json(); }),
    fetch('/api/email-contacts').then(function (r) { return r.json(); })
  ]).then(function (results) {
    allForms = results[0];
    allLeads = results[1];
    allIntegrations = results[2];
    allWa = results[3];
    allEmails = results[4];
  });
}

function showToast(message) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:99999;font-size:14px;font-weight:500;';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 3000);
}

function renderDashboard() {
  Promise.all([loadAll(), fetch('/api/chart-data').then(function(r) { return r.json(); })]).then(function (results) {
    var chartData = results[1];

    var t = allLeads.length;
    var ve = allLeads.filter(function (l) { return l.isValidEmail; }).length;
    var vp = allLeads.filter(function (l) { return l.isValidPhone; }).length;
    var ws = allLeads.filter(function (l) { return l.waStatus === 'Sent'; }).length;
    var es = allLeads.filter(function (l) { return l.emailStatus === 'Sent'; }).length;
    var wr = allLeads.filter(function (l) { return l.waReplied; }).length;
    var er = allLeads.filter(function (l) { return l.emailReplied; }).length;
    var h = allLeads.filter(function (l) { return l.tags.indexOf('hot') > -1 || l.tags.indexOf('converted') > -1; }).length;

    document.getElementById('statTotalLeads').innerText = t;
    document.getElementById('statValidEmail').innerText = ve;
    document.getElementById('statValidPhone').innerText = vp;
    document.getElementById('statWaSent').innerText = ws;
    document.getElementById('statEmailSent').innerText = es;
    document.getElementById('statWaReply').innerText = wr;
    document.getElementById('statEmailReply').innerText = er;
    document.getElementById('statConversion').innerText = t ? Math.round(h / t * 100) + '%' : '0%';
    document.getElementById('usageCount').innerText = t;

    var recentHtml = '';
    var recent = allLeads.slice(-5).reverse();
    for (var i = 0; i < recent.length; i++) {
      var l = recent[i];
      recentHtml += '<div class="flex items-center gap-3 py-2 border-b last:border-0">';
      recentHtml += '<div class="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">' + l.name.charAt(0) + '</div>';
      recentHtml += '<div class="flex-1"><div class="text-sm font-medium">' + l.name + '</div>';
      recentHtml += '<div class="text-xs text-gray-500">' + (l.email || l.phone) + '</div></div>';
      recentHtml += '<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100">' + l.source + '</span>';
      recentHtml += '</div>';
    }
    document.getElementById('recentLeads').innerHTML = recentHtml;

    var formsHtml = '';
    for (var k = 0; k < allForms.length; k++) {
      var f = allForms[k];
      formsHtml += '<div class="flex items-center gap-3 py-2 border-b last:border-0">';
      formsHtml += '<div class="flex-1"><div class="text-sm font-medium">' + f.name + '</div>';
      formsHtml += '<div class="text-xs text-gray-500 font-mono">' + f.accessKey + '</div></div>';
      formsHtml += '<span class="text-xs text-green-600">' + f.submissions + ' leads</span>';
      formsHtml += '</div>';
    }
    document.getElementById('activeForms').innerHTML = formsHtml;

    if (leadsChartInstance) leadsChartInstance.destroy();
    leadsChartInstance = new Chart(document.getElementById('leadsChart'), {
      type: 'line',
      data: {
        labels: chartData.leadsOverTime.labels,
        datasets: [{
          label: 'Leads',
          data: chartData.leadsOverTime.data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    if (sourceChartInstance) sourceChartInstance.destroy();
    sourceChartInstance = new Chart(document.getElementById('sourceChart'), {
      type: 'doughnut',
      data: {
        labels: chartData.sources.labels.length ? chartData.sources.labels : ['No Data'],
        datasets: [{
          data: chartData.sources.data.length ? chartData.sources.data : [1],
          backgroundColor: ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  });
}

function renderForms() {
  loadAll().then(function () {
    document.getElementById('formCount').innerText = allForms.length;
    var html = '';
    for (var i = 0; i < allForms.length; i++) {
      var f = allForms[i];
      html += '<tr class="hover:bg-gray-50 border-b">';
      html += '<td class="px-6 py-4"><div class="flex items-center gap-2"><span class="text-gray-400">📄</span><span class="font-medium">' + f.name + '</span></div></td>';
      html += '<td class="px-6 py-4 text-gray-500 font-mono text-xs">' + f.accessKey + ' <button onclick="copyKey(\'' + f.accessKey + '\')" class="ml-1 text-blue-600 hover:underline text-xs">Copy</button></td>';
      html += '<td class="px-6 py-4 text-gray-500">' + f.created + '</td>';
      html += '<td class="px-6 py-4 font-medium">' + f.submissions + '</td>';
      html += '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs ' + (f.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100') + '">' + f.status + '</span></td>';
      html += '<td class="px-6 py-4 text-right relative">';
      html += '<button onclick="toggleFormMenu(\'' + f.id + '\', event)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">⚙️ Manage ▾</button>';
      html += '<div id="formMenu-' + f.id + '" class="dropdown-menu hidden">';
      html += '<a onclick="openFormSetup(\'' + f.id + '\')">⚙️ Form Setup</a>';
      html += '<a onclick="openFormSettings(\'' + f.id + '\')">🔧 Settings</a>';
      html += '<a onclick="openFormSubmissions(\'' + f.id + '\')">📥 Submissions</a>';
      html += '<a onclick="openFormIntegrations(\'' + f.id + '\')">🔌 Integrations</a>';
      html += '<hr class="my-1 border-gray-200" />';
      html += '<a onclick="openRenameForm(\'' + f.id + '\')">✏️ Rename</a>';
      html += '<a onclick="deleteForm(\'' + f.id + '\')" class="text-red-600">🗑️ Delete</a>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';
    }
    document.getElementById('formsTable').innerHTML = html;
  });
}

function copyKey(key) {
  navigator.clipboard.writeText(key);
  showToast('✅ Access key copied!');
}

function toggleFormMenu(id, event) {
  event.stopPropagation();
  var allMenus = document.querySelectorAll('.dropdown-menu');
  allMenus.forEach(function(m) { m.classList.add('hidden'); });
  var menu = document.getElementById('formMenu-' + id);
  if (menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', function() {
  document.querySelectorAll('.dropdown-menu').forEach(function(m) { m.classList.add('hidden'); });
});

function openFormSetup(id) {
  var f = allForms.find(function(x) { return x.id === id; });
  if (!f) return;
  currentFormId = id;
  document.getElementById('formSetupTitle').innerText = f.name + ' — Form Setup';
  document.getElementById('formSetupKey').value = f.accessKey;
  showCodeTab('html');
  document.getElementById('formSetupModal').classList.remove('hidden');
}

function closeFormSetup() {
  document.getElementById('formSetupModal').classList.add('hidden');
}

function showCodeTab(tab) {
  var key = document.getElementById('formSetupKey').value;
  var url = 'https://leadkite-production.up.railway.app/api/webhook/' + key;

  var code = '';
  if (tab === 'html') {
    code = '<form action="' + url + '" method="POST">\n' +
           '  <input type="text" name="name" placeholder="Full Name" required>\n' +
           '  <input type="email" name="email" placeholder="Email" required>\n' +
           '  <input type="tel" name="phone" placeholder="Phone" required>\n' +
           '  <textarea name="message" placeholder="Message"></textarea>\n' +
           '  <button type="submit">Submit</button>\n' +
           '</form>';
  } else if (tab === 'js') {
    code = 'fetch("' + url + '", {\n' +
           '  method: "POST",\n' +
           '  headers: { "Content-Type": "application/json" },\n' +
           '  body: JSON.stringify({\n' +
           '    name: "John Doe",\n' +
           '    email: "john@example.com",\n' +
           '    phone: "9876543210",\n' +
           '    message: "Hello!"\n' +
           '  })\n' +
           '})\n' +
           '.then(r => r.json())\n' +
           '.then(data => console.log(data));';
  } else if (tab === 'react') {
    code = 'async function handleSubmit(e) {\n' +
           '  e.preventDefault();\n' +
           '  const res = await fetch("' + url + '", {\n' +
           '    method: "POST",\n' +
           '    headers: { "Content-Type": "application/json" },\n' +
           '    body: JSON.stringify({ name, email, phone, message })\n' +
           '  });\n' +
           '  const data = await res.json();\n' +
           '  console.log(data);\n' +
           '}';
  } else if (tab === 'astro') {
    code = '---\n' +
           '// Astro component\n' +
           '---\n' +
           '<form action="' + url + '" method="POST">\n' +
           '  <input name="name" required />\n' +
           '  <input name="email" type="email" required />\n' +
           '  <input name="phone" required />\n' +
           '  <textarea name="message"></textarea>\n' +
           '  <button type="submit">Submit</button>\n' +
           '</form>';
  }

  document.getElementById('codeBlock').textContent = code;
  document.querySelectorAll('.code-tab').forEach(function(b) {
    b.classList.remove('active', 'bg-gray-100');
    if (b.getAttribute('data-code') === tab) {
      b.classList.add('active');
    } else {
      b.classList.add('bg-gray-100');
    }
  });
}

function copyCode() {
  var code = document.getElementById('codeBlock').textContent;
  navigator.clipboard.writeText(code);
  showToast('✅ Code copied!');
}

function copyAccessKey() {
  var key = document.getElementById('formSetupKey').value;
  navigator.clipboard.writeText(key);
  showToast('✅ Access key copied!');
}

function openFormSettings(id) {
  var f = allForms.find(function(x) { return x.id === id; });
  if (!f) return;
  var newStatus = prompt('Status (Active / Paused):', f.status);
  if (!newStatus) return;
  fetch('/api/forms/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  }).then(function() {
    showToast('✅ Status updated!');
    renderForms();
  });
}

function openFormSubmissions(id) {
  fetch('/api/leads').then(function(r) { return r.json(); }).then(function(leads) {
    var filtered = leads.filter(function(l) { return l.formId === id; });
    alert('📥 ' + filtered.length + ' submissions found.\n\nCheck Lead Inbox for details.');
  });
}

function openFormIntegrations(id) {
  alert('🔌 Integrations available: Google Sheets, Telegram, Slack, Discord, Webhook.\n\nGo to Integrations page to connect.');
}

function openRenameForm(id) {
  var f = allForms.find(function(x) { return x.id === id; });
  if (!f) return;
  renamingFormId = id;
  document.getElementById('renameFormInput').value = f.name;
  document.getElementById('renameFormModal').classList.remove('hidden');
}

function closeRenameForm() {
  document.getElementById('renameFormModal').classList.add('hidden');
  renamingFormId = null;
}

function submitRenameForm() {
  var newName = document.getElementById('renameFormInput').value;
  if (!newName) { alert('Please enter a name'); return; }
  fetch('/api/forms/' + renamingFormId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  }).then(function() {
    showToast('✅ Form renamed!');
    closeRenameForm();
    renderForms();
  });
}

function deleteForm(id) {
  if (!confirm('Delete this form? All its submissions will remain in Lead Inbox.')) return;
  fetch('/api/forms/' + id, { method: 'DELETE' }).then(function() {
    showToast('🗑️ Form deleted!');
    renderForms();
  });
}

function openCreateForm() { document.getElementById('createFormModal').classList.remove('hidden'); }
function closeCreateForm() { document.getElementById('createFormModal').classList.add('hidden'); }

function submitCreateForm() {
  var name = document.getElementById('newFormName').value;
  var website = document.getElementById('newFormWebsite').value;
  var email = document.getElementById('newFormEmail').value;
  if (!name) { alert('Please enter form name'); return; }
  fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, website: website, notifyEmail: email })
  }).then(function () {
    closeCreateForm();
    document.getElementById('newFormName').value = '';
    document.getElementById('newFormWebsite').value = '';
    renderForms();
    showToast('✅ Form created!');
  });
}

function renderLeads() {
  loadAll().then(function () {
    document.getElementById('leadBadge').innerText = allLeads.length;
    document.getElementById('lTotal').innerText = allLeads.length;
    document.getElementById('lValid').innerText = allLeads.filter(function (l) { return l.isValidEmail && l.isValidPhone; }).length;
    document.getElementById('lInvalid').innerText = allLeads.filter(function (l) { return !l.isValidEmail || !l.isValidPhone; }).length;
    document.getElementById('lReplied').innerText = allLeads.filter(function (l) { return l.waReplied || l.emailReplied; }).length;

    var html = '';
    for (var i = 0; i < allLeads.length; i++) {
      var l = allLeads[i];
      html += '<tr class="hover:bg-gray-50 border-b">';
      html += '<td class="px-4 py-3"><div class="font-medium text-sm">' + l.name + '</div><div class="text-xs text-gray-400">' + l.createdAt + '</div></td>';
      html += '<td class="px-4 py-3 text-xs text-gray-600"><div>' + (l.email || '—') + '</div><div>' + (l.phone || '—') + '</div></td>';
      html += '<td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full bg-gray-100">' + l.source + '</span></td>';
      html += '<td class="px-4 py-3 text-xs"><span class="' + (l.isValidEmail ? 'text-green-600' : 'text-red-500') + '">Email ' + (l.isValidEmail ? '✓' : '✗') + '</span><br><span class="' + (l.isValidPhone ? 'text-green-600' : 'text-red-500') + '">Phone ' + (l.isValidPhone ? '✓' : '✗') + '</span></td>';
      html += '<td class="px-4 py-3 text-xs"><span class="px-2 py-0.5 rounded-full ' + (l.waStatus === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100') + '">WA: ' + l.waStatus + '</span><br><span class="px-2 py-0.5 rounded-full mt-1 inline-block ' + (l.emailStatus === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100') + '">Email: ' + l.emailStatus + '</span></td>';
      html += '<td class="px-4 py-3 text-right"><button data-lead-id="' + l.id + '" class="delete-lead-btn text-red-500 text-xs hover:underline">Delete</button></td>';
      html += '</tr>';
    }
    document.getElementById('leadsTable').innerHTML = html || '<tr><td colspan="6" class="p-6 text-center text-gray-400">No leads</td></tr>';
  });
}

function deleteLead(id) {
  if (!confirm('Delete this lead?')) return;
  fetch('/api/leads/' + id, { method: 'DELETE' }).then(function () { renderLeads(); });
}

function deleteAllLeads() {
  if (!confirm('Delete ALL leads?')) return;
  fetch('/api/leads', { method: 'DELETE' }).then(function () { renderLeads(); });
}

function bulkSend(type) {
  loadAll().then(function () {
    var ids = [];
    if (type === 'whatsapp') ids = allLeads.filter(function (l) { return l.isValidPhone; }).map(function (l) { return l.id; });
    if (type === 'email') ids = allLeads.filter(function (l) { return l.isValidEmail; }).map(function (l) { return l.id; });
    if (ids.length === 0) { alert('No recipients'); return; }
    fetch('/api/leads/bulk-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds: ids, type: type })
    }).then(function () {
      alert('Sent to ' + ids.length + ' recipients');
      renderLeads();
    });
  });
}

async function exportLeads() {
  try {
    var res = await fetch('/api/leads/export');
    var data = await res.json();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'leadkite-leads-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Exported ' + data.totalLeads + ' leads!');
  } catch (err) {
    alert('Export failed: ' + err.message);
  }
}

function openImportModal() { document.getElementById('importModal').classList.remove('hidden'); }
function closeImportModal() { document.getElementById('importModal').classList.add('hidden'); }

function handleImportFile(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    var text = e.target.result;
    try {
      var parsed = JSON.parse(text);
      if (Array.isArray(parsed)) importedLeadsData = parsed;
      else if (parsed.leads && Array.isArray(parsed.leads)) importedLeadsData = parsed.leads;
      else throw new Error('Invalid');
    } catch (err) {
      var lines = text.split('\n').filter(function (l) { return l.trim(); });
      importedLeadsData = [];
      lines.forEach(function (line, idx) {
        if (idx === 0) return;
        var parts = line.split(',');
        importedLeadsData.push({
          name: (parts[0] || '').trim(),
          email: (parts[1] || '').trim(),
          phone: (parts[2] || '').trim(),
          message: (parts[3] || '').trim()
        });
      });
    }
    document.getElementById('importPreview').innerHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-3"><strong>' + importedLeadsData.length + ' leads detected</strong></div>';
  };
  reader.readAsText(file);
}

async function submitImport() {
  if (importedLeadsData.length === 0) { alert('Please select a file first'); return; }
  var res = await fetch('/api/leads/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads: importedLeadsData })
  });
  var data = await res.json();
  if (data.success) {
    showToast('📥 Imported ' + data.added + ' leads!');
    closeImportModal();
    importedLeadsData = [];
    document.getElementById('importPreview').innerHTML = '';
    document.getElementById('importLeadsFile').value = '';
    renderLeads();
  }
}

function refreshLeads() {
  showToast('🔄 Refreshing...');
  renderLeads();
  renderDashboard();
  setTimeout(function () { showToast('✅ Refreshed!'); }, 500);
}

function openProfileModal() {
  document.getElementById('profileModal').classList.remove('hidden');
  loadProfile();
}

function closeProfileModal() { document.getElementById('profileModal').classList.add('hidden'); }

async function loadProfile() {
  var res = await fetch('/api/profile');
  var profile = await res.json();
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileEmail').value = profile.email || '';
  if (profile.image) {
    document.getElementById('profileImagePreview').innerHTML = '<img src="' + profile.image + '" class="w-20 h-20 rounded-full object-cover" />';
    document.getElementById('profileImagePreview').setAttribute('data-image', profile.image);
  }
}

async function handleProfileImage(input) {
  var file = input.files[0];
  if (!file) return;
  var formData = new FormData();
  formData.append('file', file);
  var res = await fetch('/api/upload', { method: 'POST', body: formData });
  var data = await res.json();
  if (data.success) {
    document.getElementById('profileImagePreview').innerHTML = '<img src="' + data.url + '" class="w-20 h-20 rounded-full object-cover" />';
    document.getElementById('profileImagePreview').setAttribute('data-image', data.url);
  }
}

async function saveProfile() {
  var name = document.getElementById('profileName').value;
  var email = document.getElementById('profileEmail').value;
  var image = document.getElementById('profileImagePreview').getAttribute('data-image') || '';
  await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, image: image })
  });
  document.getElementById('sidebarProfileName').innerText = name;
  document.getElementById('sidebarProfileEmail').innerText = email;
  if (image) {
    document.getElementById('sidebarProfileImage').innerHTML = '<img src="' + image + '" class="w-8 h-8 rounded-full object-cover" />';
  }
  showToast('✅ Profile saved!');
  closeProfileModal();
}

async function handleWaMediaUpload(input) {
  var file = input.files[0];
  if (!file) return;
  var formData = new FormData();
  formData.append('file', file);
  var res = await fetch('/api/upload', { method: 'POST', body: formData });
  var data = await res.json();
  if (data.success) {
    waMediaUrl = data.url;
    waMediaType = data.mimetype.indexOf('video') > -1 ? 'video' : 'image';
    var preview = document.getElementById('waMediaPreview');
    if (waMediaType === 'image') {
      preview.innerHTML = '<img src="' + waMediaUrl + '" class="w-32 h-32 object-cover rounded-lg border" />';
    } else {
      preview.innerHTML = '<video src="' + waMediaUrl + '" class="w-32 h-32 object-cover rounded-lg border" controls></video>';
    }
    showToast('✅ Media attached!');
  }
}

function showCampTab(t) {
  var contents = document.querySelectorAll('.camp-content');
  for (var i = 0; i < contents.length; i++) contents[i].classList.add('hidden');
  var target = document.getElementById('ctab-' + t);
  if (target) target.classList.remove('hidden');
  var btns = document.querySelectorAll('[data-ctab]');
  for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
  var a = document.querySelector('[data-ctab="' + t + '"]');
  if (a) a.classList.add('active');
}

function renderCampaigns() {
  loadAll().then(function () {
    renderWaList();
    renderEmailList();
  });
}

function waFormat(cmd) { document.execCommand(cmd, false, null); var el = document.getElementById('waTemplateContent'); if (el) el.focus(); }
function waInsertLink() { var url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); }
function waInsertEmoji() { var emoji = prompt('Enter emoji:'); if (emoji) document.execCommand('insertText', false, emoji); }
function toggleWaVarMenu() { document.getElementById('waVarMenu').classList.toggle('hidden'); }
function waInsertVar(v) { document.execCommand('insertText', false, '{{' + v + '}}'); document.getElementById('waVarMenu').classList.add('hidden'); }

function showWaAddTab(tab) {
  document.querySelectorAll('.wa-add-content').forEach(function (c) { c.classList.add('hidden'); });
  document.getElementById('wa-add-' + tab).classList.remove('hidden');
  document.querySelectorAll('[data-watab]').forEach(function (b) {
    b.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    b.classList.add('text-gray-500');
  });
  var active = document.querySelector('[data-watab="' + tab + '"]');
  if (active) {
    active.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
    active.classList.remove('text-gray-500');
  }
}

async function submitAddWa() {
  var name = document.getElementById('newWaName').value;
  var number = document.getElementById('newWaNumber').value;
  if (!name || !number) { alert('Please fill both fields'); return; }
  await fetch('/api/wa-numbers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, number: number }) });
  document.getElementById('newWaName').value = '';
  document.getElementById('newWaNumber').value = '';
  renderCampaigns();
}

async function bulkAddWa() {
  var input = document.getElementById('bulkWaInput').value.trim();
  if (!input) { alert('Please paste numbers'); return; }
  var lines = input.split('\n').filter(function (l) { return l.trim(); });
  var list = [];
  lines.forEach(function (line) {
    var parts = line.split(',');
    var number = (parts[0] || '').trim().replace(/[^0-9]/g, '');
    var name = (parts[1] || 'Unknown').trim();
    if (number.length === 10) list.push({ number: number, name: name });
  });
  if (list.length === 0) { alert('No valid 10-digit numbers found'); return; }
  await fetch('/api/wa-numbers/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ list: list }) });
  document.getElementById('bulkWaInput').value = '';
  showToast('✅ Added ' + list.length + ' numbers!');
  renderCampaigns();
}

function handleWaFile(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    var text = e.target.result;
    document.getElementById('bulkWaInput').value = text;
    showWaAddTab('bulk');
    var lines = text.split('\n').filter(function (l) { return l.trim(); });
    document.getElementById('waFilePreview').innerHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"><strong>' + lines.length + ' rows detected</strong></div>';
  };
  reader.readAsText(file);
}

function renderWaList() {
  var searchEl = document.getElementById('waSearch');
  var search = searchEl ? searchEl.value.toLowerCase() : '';
  var filtered = allWa.filter(function (w) {
    return !search || (w.name && w.name.toLowerCase().indexOf(search) > -1) || (w.number && w.number.indexOf(search) > -1);
  });
  var count = document.getElementById('waCount');
  if (count) count.innerText = allWa.length;
  var html = '';
  filtered.forEach(function (w) {
    html += '<div class="p-2 border-b flex items-center justify-between hover:bg-gray-50">';
    html += '<div class="flex-1 min-w-0"><div class="font-medium text-sm truncate">' + w.name + '</div>';
    html += '<div class="text-xs text-gray-500">' + w.number + '</div></div>';
    html += '<button data-wa-id="' + w.id + '" class="delete-wa-btn text-red-500 text-xs hover:underline">Delete</button>';
    html += '</div>';
  });
  document.getElementById('waList').innerHTML = html || '<div class="p-4 text-center text-gray-400 text-sm">No numbers added</div>';
}

async function sendWaCampaign() {
  var content = document.getElementById('waTemplateContent').innerHTML;
  if (!content || content.trim() === '') { alert('Please enter message'); return; }
  var plainText = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  var res = await fetch('/api/wa-campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('waTemplateName').value || 'Untitled',
      message: plainText,
      media: waMediaUrl,
      mediaType: waMediaType,
      recipients: allWa.map(function (w) { return w.number; })
    })
  });
  var data = await res.json();
  if (data.success) {
    var mediaText = waMediaUrl ? ' + media attached' : '';
    document.getElementById('waLog').innerHTML = '<div class="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-medium">✅ WhatsApp campaign created with ' + data.campaign.recipients.length + ' recipients' + mediaText + '!</div>';
    setTimeout(function () { document.getElementById('waLog').innerHTML = ''; }, 5000);
    waMediaUrl = null; waMediaType = null;
    document.getElementById('waMediaPreview').innerHTML = '';
    document.getElementById('waMediaUpload').value = '';
  }
}

function emailFormat(cmd) { document.execCommand(cmd, false, null); document.getElementById('emailBody').focus(); }
function emailInsertLink() { var url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); }
function emailInsertEmoji() { var emoji = prompt('Enter emoji:'); if (emoji) document.execCommand('insertText', false, emoji); }
function toggleEmailVarMenu() { document.getElementById('emailVarMenu').classList.toggle('hidden'); }
function emailInsertVar(v) { document.execCommand('insertText', false, '{{' + v + '}}'); document.getElementById('emailVarMenu').classList.add('hidden'); }

function showEmailAddTab(tab) {
  document.querySelectorAll('.email-add-content').forEach(function (c) { c.classList.add('hidden'); });
  document.getElementById('email-add-' + tab).classList.remove('hidden');
  document.querySelectorAll('[data-etab]').forEach(function (b) {
    b.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    b.classList.add('text-gray-500');
  });
  var active = document.querySelector('[data-etab="' + tab + '"]');
  if (active) {
    active.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
    active.classList.remove('text-gray-500');
  }
}

async function submitAddEmail() {
  var name = document.getElementById('newEmailName').value;
  var company = document.getElementById('newEmailCompany').value || '-';
  var email = document.getElementById('newEmailAddress').value;
  if (!email || !name) { alert('Please fill name and email'); return; }
  await fetch('/api/email-contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, company: company }) });
  document.getElementById('newEmailName').value = '';
  document.getElementById('newEmailCompany').value = '';
  document.getElementById('newEmailAddress').value = '';
  renderCampaigns();
}

async function bulkAddEmail() {
  var input = document.getElementById('bulkEmailInput').value.trim();
  if (!input) { alert('Please paste emails'); return; }
  var lines = input.split('\n').filter(function (l) { return l.trim(); });
  var list = [];
  lines.forEach(function (line) {
    var parts = line.split(',');
    var email = (parts[0] || '').trim();
    var name = (parts[1] || 'Unknown').trim();
    var company = (parts[2] || '-').trim();
    if (email.indexOf('@') > -1) list.push({ email: email, name: name, company: company });
  });
  if (list.length === 0) { alert('No valid emails found'); return; }
  await fetch('/api/email-contacts/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ list: list }) });
  document.getElementById('bulkEmailInput').value = '';
  showToast('✅ Added ' + list.length + ' contacts!');
  renderCampaigns();
}

function handleEmailFile(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    var text = e.target.result;
    document.getElementById('bulkEmailInput').value = text;
    showEmailAddTab('bulk');
    var lines = text.split('\n').filter(function (l) { return l.trim(); });
    document.getElementById('emailFilePreview').innerHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"><strong>' + lines.length + ' rows detected</strong></div>';
  };
  reader.readAsText(file);
}

function renderEmailList() {
  var searchEl = document.getElementById('emailSearch');
  var search = searchEl ? searchEl.value.toLowerCase() : '';
  var filtered = allEmails.filter(function (e) {
    return !search || (e.name && e.name.toLowerCase().indexOf(search) > -1) || (e.email && e.email.toLowerCase().indexOf(search) > -1);
  });
  var count = document.getElementById('emailCount');
  if (count) count.innerText = allEmails.length;
  var html = '';
  filtered.forEach(function (e) {
    html += '<div class="p-2 border-b flex items-center justify-between hover:bg-gray-50">';
    html += '<div class="flex-1 min-w-0"><div class="font-medium text-sm truncate">' + e.name + '</div>';
    html += '<div class="text-xs text-gray-500 truncate">' + e.email + '</div>';
    if (e.company && e.company !== '-') html += '<div class="text-xs text-gray-400">' + e.company + '</div>';
    html += '</div>';
    html += '<button data-email-del-id="' + e.id + '" class="delete-email-btn text-red-500 text-xs hover:underline">Delete</button>';
    html += '</div>';
  });
  document.getElementById('emailList').innerHTML = html || '<div class="p-4 text-center text-gray-400 text-sm">No contacts</div>';
}

function openEmailPicker() { document.getElementById('emailPickerModal').classList.remove('hidden'); renderEmailPickerList(); }
function closeEmailPicker() { document.getElementById('emailPickerModal').classList.add('hidden'); }

function renderEmailPickerList() {
  var searchEl = document.getElementById('emailPickerSearch');
  var search = searchEl ? searchEl.value.toLowerCase() : '';
  var html = '';
  allEmails.forEach(function (e) {
    if (search && e.name.toLowerCase().indexOf(search) === -1 && e.email.toLowerCase().indexOf(search) === -1) return;
    var checked = emailRecipients.indexOf(e.email) > -1 ? 'checked' : '';
    html += '<label class="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b">';
    html += '<input type="checkbox" ' + checked + ' data-picker-email="' + e.email + '" class="email-picker-cb w-4 h-4" />';
    html += '<div class="flex-1"><div class="text-sm font-medium">' + e.name + '</div><div class="text-xs text-gray-500">' + e.email + '</div></div>';
    html += '</label>';
  });
  document.getElementById('emailPickerList').innerHTML = html || '<div class="p-4 text-center text-gray-400 text-sm">No contacts</div>';
}

function confirmEmailRecipients() {
  var cbs = document.querySelectorAll('.email-picker-cb');
  emailRecipients = [];
  cbs.forEach(function (cb) { if (cb.checked) emailRecipients.push(cb.getAttribute('data-picker-email')); });
  renderEmailChips();
  closeEmailPicker();
}

function renderEmailChips() {
  var html = '';
  emailRecipients.forEach(function (e) {
    html += '<span class="chip">' + e + '<button type="button" data-remove-chip="' + e + '" class="remove-chip-btn">×</button></span>';
  });
  document.getElementById('emailChips').innerHTML = html;
}

async function sendEmailCampaign() {
  if (emailRecipients.length === 0) { alert('Please add recipients'); return; }
  var subject = document.getElementById('emailSubject').value;
  var body = document.getElementById('emailBody').innerHTML;
  if (!subject) { alert('Please enter subject'); return; }
  var res = await fetch('/api/email-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: emailRecipients, subject: subject, body: body }) });
  var data = await res.json();
  if (data.success) {
    document.getElementById('emailLog').innerHTML = '<div class="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-medium">✅ Email sent to ' + data.sent + ' recipients!</div>';
    setTimeout(function () { document.getElementById('emailLog').innerHTML = ''; }, 5000);
    emailRecipients = [];
    renderEmailChips();
  }
}

function deleteEmailDraft() {
  if (!confirm('Delete this draft?')) return;
  document.getElementById('emailSubject').value = '';
  document.getElementById('emailBody').innerHTML = '';
  emailRecipients = [];
  renderEmailChips();
}

async function deleteEmailContact(id) {
  if (!confirm('Delete this contact?')) return;
  await fetch('/api/email-contacts/' + id, { method: 'DELETE' });
  renderCampaigns();
}

function showTrackTab(t) {
  var contents = document.querySelectorAll('.track-content');
  for (var i = 0; i < contents.length; i++) contents[i].classList.add('hidden');
  var target = document.getElementById('ttab-' + t);
  if (target) target.classList.remove('hidden');
  var btns = document.querySelectorAll('[data-ttab]');
  for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
  var a = document.querySelector('[data-ttab="' + t + '"]');
  if (a) a.classList.add('active');
  if (t === 'whatsapp') renderWaTrack();
  if (t === 'email') renderEmailTrack();
}

function renderWaTrack() {
  loadAll().then(function () {
    var wl = allLeads.filter(function (l) { return l.waStatus === 'Sent'; });
    document.getElementById('waTSent').innerText = wl.length;
    document.getElementById('waTDelivered').innerText = wl.filter(function (l) { return l.waDelivered; }).length;
    document.getElementById('waTRead').innerText = wl.filter(function (l) { return l.waRead; }).length;
    document.getElementById('waTReplied').innerText = wl.filter(function (l) { return l.waReplied; }).length;
    document.getElementById('waTRate').innerText = wl.length ? Math.round(wl.filter(function (l) { return l.waReplied; }).length / wl.length * 100) + '%' : '0%';
    var html = '';
    wl.forEach(function (l) {
      html += '<tr class="border-b"><td class="px-4 py-2 font-medium text-sm">' + l.name + '</td><td class="px-4 py-2 text-xs text-gray-500">' + l.phone + '</td><td class="px-4 py-2 text-center">' + ic(true) + '</td><td class="px-4 py-2 text-center">' + ic(l.waDelivered) + '</td><td class="px-4 py-2 text-center">' + ic(l.waRead) + '</td><td class="px-4 py-2 text-center">' + ic(l.waReplied) + '</td></tr>';
    });
    document.getElementById('waTrackTable').innerHTML = html || '<tr><td colspan="6" class="p-4 text-center text-gray-400">No data</td></tr>';
  });
}

function renderEmailTrack() {
  loadAll().then(function () {
    var el = allLeads.filter(function (l) { return l.emailStatus === 'Sent'; });
    document.getElementById('emTSent').innerText = el.length;
    document.getElementById('emTDelivered').innerText = el.length;
    document.getElementById('emTOpened').innerText = el.filter(function (l) { return l.emailOpened; }).length;
    document.getElementById('emTClicked').innerText = el.filter(function (l) { return l.emailClicked; }).length;
    document.getElementById('emTReplied').innerText = el.filter(function (l) { return l.emailReplied; }).length;
    var html = '';
    el.forEach(function (l) {
      html += '<tr class="border-b"><td class="px-4 py-2 font-medium text-sm">' + l.name + '</td><td class="px-4 py-2 text-xs text-gray-500 truncate">' + l.email + '</td><td class="px-4 py-2 text-center">' + ic(true) + '</td><td class="px-4 py-2 text-center">' + ic(l.emailOpened) + '</td><td class="px-4 py-2 text-center">' + ic(l.emailClicked) + '</td><td class="px-4 py-2 text-center">' + ic(l.emailReplied) + '</td></tr>';
    });
    document.getElementById('emTrackTable').innerHTML = html || '<tr><td colspan="6" class="p-4 text-center text-gray-400">No data</td></tr>';
  });
}

function ic(ok) { return ok ? '<span class="text-green-500">✓</span>' : '<span class="text-gray-300">—</span>'; }

function renderIntegrations() {
  loadAll().then(function () {
    var html = '';
    allIntegrations.forEach(function (ig) {
      html += '<div class="bg-white rounded-xl border p-5 flex items-center gap-4">';
      html += '<div class="text-3xl">' + ig.icon + '</div>';
      html += '<div class="flex-1"><div class="font-semibold text-gray-900">' + ig.name + '</div><div class="text-sm text-gray-500">' + ig.desc + '</div></div>';
      html += '<button data-integration-id="' + ig.id + '" class="toggle-integration-btn px-4 py-2 rounded-lg text-sm font-medium ' + (ig.connected ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white') + '">' + (ig.connected ? '✓ Connected' : 'Connect') + '</button>';
      html += '</div>';
    });
    document.getElementById('integrationsList').innerHTML = html;
  });
}

function attachHandlers() {
  var navs = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navs.length; i++) {
    (function (el) {
      el.addEventListener('click', function () { showPage(el.getAttribute('data-page')); });
    })(navs[i]);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.classList.contains('delete-lead-btn')) deleteLead(t.getAttribute('data-lead-id'));
    if (t.classList.contains('delete-wa-btn')) fetch('/api/wa-numbers/' + t.getAttribute('data-wa-id'), { method: 'DELETE' }).then(function () { renderCampaigns(); });
    if (t.classList.contains('delete-email-btn')) deleteEmailContact(t.getAttribute('data-email-del-id'));
    if (t.classList.contains('remove-chip-btn')) {
      var email = t.getAttribute('data-remove-chip');
      emailRecipients = emailRecipients.filter(function (e) { return e !== email; });
      renderEmailChips();
    }
    if (t.classList.contains('toggle-integration-btn')) {
      fetch('/api/integrations/' + t.getAttribute('data-integration-id') + '/toggle', { method: 'POST' }).then(function () { renderIntegrations(); });
    }
  });
}

window.addEventListener('DOMContentLoaded', function () {
  attachHandlers();
  loadAll().then(function () { showPage('dashboard'); });
  loadProfile();
  fetch('/api/profile').then(function (r) { return r.json(); }).then(function (p) {
    document.getElementById('sidebarProfileName').innerText = p.name || 'User';
    document.getElementById('sidebarProfileEmail').innerText = p.email || '';
    if (p.image) document.getElementById('sidebarProfileImage').innerHTML = '<img src="' + p.image + '" class="w-8 h-8 rounded-full object-cover" />';
  });
});

var eventSource = new EventSource('/api/events');
eventSource.onmessage = function (e) {
  var data = JSON.parse(e.data);
  if (data.type === 'new-lead') {
    showToast('🔔 New lead: ' + data.lead.name);
    var visiblePage = document.querySelector('.page:not(.hidden)');
    if (visiblePage) {
      if (visiblePage.id === 'page-dashboard') renderDashboard();
      if (visiblePage.id === 'page-leads') renderLeads();
      if (visiblePage.id === 'page-forms') renderForms();
    }
  }
  if (data.type === 'refresh-all') {
    var vp = document.querySelector('.page:not(.hidden)');
    if (vp) {
      if (vp.id === 'page-dashboard') renderDashboard();
      if (vp.id === 'page-leads') renderLeads();
    }
  }
};

setInterval(function () {
  var visiblePage = document.querySelector('.page:not(.hidden)');
  if (!visiblePage) return;
  if (visiblePage.id === 'page-dashboard') renderDashboard();
  if (visiblePage.id === 'page-leads') renderLeads();
}, 5000);
