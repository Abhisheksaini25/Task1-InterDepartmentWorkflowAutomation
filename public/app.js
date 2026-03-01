// ===== HOSPITAL WORKFLOW SYSTEM — FRONTEND APP =====

const API = '';  // same origin

// ===== TOKEN MANAGEMENT =====
function getToken() { return localStorage.getItem('hw_token'); }
function setToken(t) { localStorage.setItem('hw_token', t); }
function removeToken() { localStorage.removeItem('hw_token'); }
function getUser() {
    try { return JSON.parse(localStorage.getItem('hw_user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('hw_user', JSON.stringify(u)); }
function removeUser() { localStorage.removeItem('hw_user'); }

// ===== DEPARTMENT → SECTION ACCESS MAP =====
const DEPT_SECTIONS = {
    'Registration department': ['dashboard', 'patients', 'requests', 'history'],
    'Radiology department': ['dashboard', 'radiology', 'history'],
    'Billing department': ['dashboard', 'billing', 'history'],
    'Reports department': ['dashboard', 'reports', 'history'],
};
const ALL_SECTIONS = ['dashboard', 'patients', 'requests', 'radiology', 'billing', 'reports', 'history', 'register'];

function getAllowedSections(user) {
    if (!user) return ['dashboard'];
    if (user.role === 'ADMIN') return ALL_SECTIONS;
    return DEPT_SECTIONS[user.department] || ['dashboard'];
}

// ===== API FETCH WRAPPER =====
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API}${endpoint}`, { ...options, headers });
        const data = await res.json();

        if (res.status === 401) {
            removeToken();
            removeUser();
            showLogin();
            toast('Session expired. Please login again.', 'error');
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            throw new Error(data.message || data.error || `Error ${res.status}`);
        }

        return data;
    } catch (err) {
        if (err.message !== 'Unauthorized') {
            throw err;
        }
    }
}

// ===== TOAST NOTIFICATIONS =====
function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// ===== PAGE SWITCHING =====
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app-page').style.display = 'none';
}

function showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-page').style.display = 'block';
    const user = getUser();
    if (user) {
        document.getElementById('user-name-header').textContent = user.name || 'User';
        document.getElementById('user-role-header').textContent = user.role || 'STAFF';
        document.getElementById('user-avatar').textContent = (user.name || 'U')[0].toUpperCase();

        // Dashboard stats
        document.getElementById('stat-role').textContent = user.role || '—';
        document.getElementById('stat-dept').textContent = user.department || 'All Departments';
        document.getElementById('stat-email').textContent = user.email || '—';
        document.getElementById('welcome-text').textContent = `Welcome back, ${user.name}!`;
        document.getElementById('welcome-dept').textContent = user.department || 'Hospital Admin Dashboard';

        // Build sidebar based on role
        buildSidebar(user);
    }
    showSection('dashboard');
}

// ===== ROLE-BASED SIDEBAR =====
function buildSidebar(user) {
    const allowed = getAllowedSections(user);

    // Hide/show each sidebar link
    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
        const section = link.getAttribute('data-section');
        if (allowed.includes(section)) {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });

    // Admin nav (register staff)
    const adminNav = document.getElementById('admin-nav');
    if (user.role === 'ADMIN') {
        adminNav.style.display = 'block';
    } else {
        adminNav.style.display = 'none';
    }
}

function showSection(name) {
    const user = getUser();
    const allowed = getAllowedSections(user);

    // Block access to sections the user doesn't have permission for
    if (!allowed.includes(name)) {
        return;
    }

    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    // Show target
    const sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');

    const link = document.querySelector(`.sidebar-link[data-section="${name}"]`);
    if (link) link.classList.add('active');

    // Update header
    const titles = {
        dashboard: 'Dashboard',
        patients: 'Patient Management',
        requests: 'Request Management',
        radiology: 'Radiology Department',
        billing: 'Billing Department',
        reports: 'Reports Department',
        history: 'Request History',
        register: 'Staff Management'
    };
    document.getElementById('page-title').textContent = titles[name] || 'Dashboard';

    // Auto-load data for certain sections
    if (name === 'dashboard') loadDashboard();
    if (name === 'patients') loadPatients();
    if (name === 'requests') loadRequests();
    if (name === 'radiology') loadRadiologyQueue();
    if (name === 'billing') loadBillingQueue();
    if (name === 'reports') loadReportsQueue();
    if (name === 'register') loadStaff();
}

// ===== STATUS BADGE HELPER =====
function statusBadge(status) {
    const s = (status || '').toUpperCase();
    const map = {
        'PENDING_APPROVAL': ['badge-pending', 'Pending Approval'],
        'APPROVED': ['badge-approved', 'Approved'],
        'WAITING FOR PAY': ['badge-warning', 'Waiting for Pay'],
        'IN_PROGRESS': ['badge-progress', 'In Progress'],
        'COMPLETE/READY_FOR_REPORT': ['badge-complete', 'Ready for Report'],
        'REPORT_GENERATED': ['badge-report', 'Report Generated'],
        'CLOSED': ['badge-closed', 'Closed'],
        'PENDING': ['badge-pending', 'Pending'],
        'PAID': ['badge-paid', 'Paid'],
    };
    const [cls, label] = map[s] || ['badge-pending', s];
    return `<span class="badge ${cls}">${label}</span>`;
}

function shortId(id) {
    if (!id) return '—';
    const str = String(id);
    const display = str.length > 8 ? '...' + str.slice(-8) : str;
    return `<span class="copyable-id" title="Click to copy: ${str}" onclick="copyId('${str}')" style="cursor:pointer;border-bottom:1px dashed var(--text-secondary);">${display}</span>`;
}

function copyId(id) {
    navigator.clipboard.writeText(id).then(() => {
        toast('ID copied: ' + id, 'success');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('ID copied: ' + id, 'success');
    });
}

// ===== DASHBOARD =====
async function loadDashboard() {
    const user = getUser();
    const container = document.getElementById('dashboard-dynamic');
    if (!container) return;

    if (user.role === 'ADMIN') {
        await loadAdminDashboard(container);
    } else {
        await loadStaffDashboard(container, user);
    }
}

async function loadAdminDashboard(container) {
    container.innerHTML = '<div style="text-align:center;padding:40px;"><span class="spinner"></span> Loading overview...</div>';

    let patientsHtml = '';
    let requestsHtml = '';

    // Load all patients
    try {
        const pData = await apiFetch('/api/patient/viewpatients');
        if (pData && pData.data && pData.data.length > 0) {
            patientsHtml = `
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <h4>👤 All Patients (${pData.data.length})</h4>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Phone</th><th>Age</th><th>Gender</th></tr>
              </thead>
              <tbody>
                ${pData.data.map(p => `
                  <tr>
                    <td title="${p._id}">${shortId(p._id)}</td>
                    <td>${p.fullname?.firstname || ''} ${p.fullname?.lastname || ''}</td>
                    <td>${p.phone || '—'}</td>
                    <td>${p.age || '—'}</td>
                    <td>${p.gender || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
        } else {
            patientsHtml = '<div class="card" style="margin-bottom:24px;"><div class="empty-state"><p>No patients registered yet</p></div></div>';
        }
    } catch (e) {
        patientsHtml = '<div class="card" style="margin-bottom:24px;"><div class="empty-state"><p>Could not load patients</p></div></div>';
    }

    // Load all requests
    try {
        const rData = await apiFetch('/api/request/viewrequest');
        if (rData && rData.data && rData.data.length > 0) {
            // Status summary counts
            const counts = {};
            rData.data.forEach(r => {
                const s = r.status || 'UNKNOWN';
                counts[s] = (counts[s] || 0) + 1;
            });

            const countsHtml = Object.entries(counts).map(([status, count]) => `
        <div class="stat-card accent" style="text-align:center;">
          <div class="stat-value">${count}</div>
          <div class="stat-label">${statusBadge(status)}</div>
        </div>
      `).join('');

            requestsHtml = `
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <h4>📊 Request Status Overview</h4>
          </div>
          <div class="stats-grid" style="padding:0 0 16px 0;">
            ${countsHtml}
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h4>📋 All Requests (${rData.data.length})</h4>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Request ID</th><th>Patient</th><th>Type</th><th>Department</th><th>Status</th><th>Payment</th></tr>
              </thead>
              <tbody>
                ${rData.data.map(r => {
                const pName = (r.patientId && typeof r.patientId === 'object')
                    ? `${r.patientId.fullname?.firstname || ''} ${r.patientId.fullname?.lastname || ''}`
                    : shortId(r.patientId);
                return `
                  <tr>
                    <td title="${r._id}">${shortId(r._id)}</td>
                    <td>${pName}</td>
                    <td>${r.type || '—'}</td>
                    <td>${r.currentDepartment || '—'}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td>${statusBadge(r.paymentStatus)}</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
        } else {
            requestsHtml = '<div class="card"><div class="empty-state"><p>No requests in the system yet</p></div></div>';
        }
    } catch (e) {
        requestsHtml = '<div class="card"><div class="empty-state"><p>Could not load requests</p></div></div>';
    }

    container.innerHTML = patientsHtml + requestsHtml;
}

async function loadStaffDashboard(container, user) {
    container.innerHTML = '<div style="text-align:center;padding:40px;"><span class="spinner"></span> Loading your queue...</div>';

    const dept = user.department;
    let queueHtml = '';

    try {
        let endpoint = '';
        let deptLabel = dept;
        let actionLabel = '';

        if (dept === 'Registration department') {
            endpoint = '/api/request/viewrequest';
            actionLabel = 'requests in your department';
        } else if (dept === 'Radiology department') {
            endpoint = '/api/radiology/radiology/queue';
            actionLabel = 'items in radiology queue';
        } else if (dept === 'Billing department') {
            endpoint = '/api/billing/billing/queue';
            actionLabel = 'items pending payment';
        } else if (dept === 'Reports department') {
            endpoint = '/api/report/reports/queue';
            actionLabel = 'items ready for report';
        }

        if (endpoint) {
            const data = await apiFetch(endpoint);
            const items = (data && data.data) ? data.data : [];

            // Status counts
            const counts = {};
            items.forEach(r => {
                const s = r.status || 'UNKNOWN';
                counts[s] = (counts[s] || 0) + 1;
            });

            const countsHtml = Object.entries(counts).map(([status, count]) => `
        <div class="stat-card accent" style="text-align:center;">
          <div class="stat-value">${count}</div>
          <div class="stat-label">${statusBadge(status)}</div>
        </div>
      `).join('');

            if (items.length > 0) {
                queueHtml = `
          <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
              <h4>📊 Your Queue — ${items.length} ${actionLabel}</h4>
            </div>
            <div class="stats-grid">${countsHtml}</div>
          </div>
          <div class="card">
            <div class="card-header">
              <h4>📋 Pending Items</h4>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr><th>Request ID</th><th>Patient ID</th><th>Type</th><th>Status</th><th>Payment</th></tr>
                </thead>
                <tbody>
                  ${items.map(r => `
                    <tr>
                      <td title="${r._id}">${shortId(r._id)}</td>
                      <td title="${r.patientId}">${shortId(r.patientId)}</td>
                      <td>${r.type || '—'}</td>
                      <td>${statusBadge(r.status)}</td>
                      <td>${statusBadge(r.paymentStatus)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
            } else {
                queueHtml = `
          <div class="card">
            <div class="empty-state">
              <div class="icon">✨</div>
              <p>No pending items in your department. All caught up!</p>
            </div>
          </div>
        `;
            }
        }
    } catch (e) {
        queueHtml = `
      <div class="card">
        <div class="empty-state"><p>Could not load department queue</p></div>
      </div>
    `;
    }

    container.innerHTML = queueHtml;
}

// ===== LOGIN =====
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.innerHTML = '<span class="spinner"></span> Signing In...';
    btn.disabled = true;

    try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data && data.data) {
            setToken(data.data.token);
            setUser(data.data.user);
            toast('Login successful!', 'success');
            showApp();
        }
    } catch (err) {
        toast(err.message || 'Login failed', 'error');
    } finally {
        btn.innerHTML = 'Sign In';
        btn.disabled = false;
    }
});

// ===== LOGOUT =====
async function logout() {
    try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    removeToken();
    removeUser();
    showLogin();
    toast('Logged out successfully', 'info');
}

// ===== PATIENTS =====
document.getElementById('patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const body = {
            fullname: {
                firstname: document.getElementById('p-firstname').value,
                middlename: document.getElementById('p-middlename').value,
                lastname: document.getElementById('p-lastname').value,
            },
            phone: document.getElementById('p-phone').value,
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value,
        };
        const data = await apiFetch('/api/patient/Createpatients', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (data) {
            toast('Patient registered successfully!', 'success');
            document.getElementById('patient-form').reset();
            loadPatients();
        }
    } catch (err) {
        toast(err.message, 'error');
    }
});

async function loadPatients() {
    try {
        const data = await apiFetch('/api/patient/viewpatients');
        const tbody = document.getElementById('patients-table-body');
        const isAdmin = getUser()?.role === 'ADMIN';
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(p => `
        <tr>
          <td title="${p._id}">${shortId(p._id)}</td>
          <td>${p.fullname?.firstname || '—'}</td>
          <td>${p.fullname?.lastname || '—'}</td>
          <td>${p.phone || '—'}</td>
          <td>${p.age || '—'}</td>
          <td>${p.gender || '—'}</td>
          ${isAdmin ? `<td><button class="btn btn-danger btn-sm" onclick="deletePatient('${p._id}')">🗑️</button></td>` : ''}
        </tr>
      `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No patients found</p></td></tr>';
        }
    } catch (err) {
        // Silently handle — may not have permission
        const tbody = document.getElementById('patients-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No patients found</p></td></tr>';
    }
}

// Search patient by phone
document.getElementById('search-patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('search-phone').value;
    const el = document.getElementById('search-result');
    try {
        const data = await apiFetch(`/api/patient/viewpatients/phone/${phone}`);
        if (data && data.data) {
            const p = data.data;
            el.innerHTML = `
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-label">ID</div><div class="detail-value">${p._id}</div></div>
          <div class="detail-item"><div class="detail-label">Name</div><div class="detail-value">${p.fullname?.firstname || ''} ${p.fullname?.middlename || ''} ${p.fullname?.lastname || ''}</div></div>
          <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${p.phone}</div></div>
          <div class="detail-item"><div class="detail-label">Age</div><div class="detail-value">${p.age}</div></div>
          <div class="detail-item"><div class="detail-label">Gender</div><div class="detail-value">${p.gender}</div></div>
        </div>
      `;
        }
    } catch (err) {
        el.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
    }
});

// ===== REQUESTS =====
document.getElementById('request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const body = {
            patientId: document.getElementById('r-patientId').value,
            type: document.getElementById('r-type').value,
        };
        const data = await apiFetch('/api/request/Createrequests', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (data) {
            toast('Request created successfully!', 'success');
            document.getElementById('request-form').reset();
            loadRequests();
        }
    } catch (err) {
        toast(err.message, 'error');
    }
});

async function loadRequests() {
    try {
        const data = await apiFetch('/api/request/viewrequest');
        const tbody = document.getElementById('requests-table-body');
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(r => `
        <tr>
          <td title="${r._id}">${shortId(r._id)}</td>
          <td title="${r.patientId}">${shortId(r.patientId)}</td>
          <td>${r.type || '—'}</td>
          <td>${r.currentDepartment || '—'}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${statusBadge(r.paymentStatus)}</td>
        </tr>
      `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No requests in your department</p></td></tr>';
        }
    } catch (err) {
        const tbody = document.getElementById('requests-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No requests found</p></td></tr>';
    }
}

// View single request
document.getElementById('view-request-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('view-req-id').value;
    const el = document.getElementById('request-detail');
    try {
        const data = await apiFetch(`/api/request/viewrequest/${id}`);
        if (data && data.data) {
            const r = data.data;
            el.innerHTML = `
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-label">Request ID</div><div class="detail-value">${r._id}</div></div>
          <div class="detail-item"><div class="detail-label">Patient ID</div><div class="detail-value">${r.patientId}</div></div>
          <div class="detail-item"><div class="detail-label">Type</div><div class="detail-value">${r.type}</div></div>
          <div class="detail-item"><div class="detail-label">Department</div><div class="detail-value">${r.currentDepartment || '—'}</div></div>
          <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${statusBadge(r.status)}</div></div>
          <div class="detail-item"><div class="detail-label">Payment</div><div class="detail-value">${statusBadge(r.paymentStatus)}</div></div>
        </div>
      `;
        }
    } catch (err) {
        el.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
    }
});

// ===== RADIOLOGY =====
async function loadRadiologyQueue() {
    try {
        const data = await apiFetch('/api/radiology/radiology/queue');
        const tbody = document.getElementById('radiology-table-body');
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(r => `
        <tr>
          <td title="${r._id}">${shortId(r._id)}</td>
          <td title="${r.patientId}">${shortId(r.patientId)}</td>
          <td>${r.type || '—'}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${statusBadge(r.paymentStatus)}</td>
          <td class="action-group">
            ${r.status === 'PENDING_APPROVAL' ? `<button class="btn btn-success btn-sm" onclick="radiologyApprove('${r._id}')">✅ Approve</button>` : ''}
            ${r.status === 'IN_PROGRESS' ? `<button class="btn btn-primary btn-sm" onclick="radiologyComplete('${r._id}')">🏁 Complete</button>` : ''}
          </td>
        </tr>
      `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No items in radiology queue</p></td></tr>';
        }
    } catch (err) {
        // Silently handle if no access
        const tbody = document.getElementById('radiology-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No items in radiology queue</p></td></tr>';
    }
}

document.getElementById('radiology-approve-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rad-approve-id').value;
    if (id) await radiologyApprove(id);
});

document.getElementById('radiology-complete-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rad-complete-id').value;
    if (id) await radiologyComplete(id);
});

async function radiologyApprove(id) {
    try {
        await apiFetch(`/api/radiology/requests/${id}/approve`, { method: 'PATCH' });
        toast('Request approved!', 'success');
        loadRadiologyQueue();
    } catch (err) {
        toast(err.message, 'error');
    }
}

async function radiologyComplete(id) {
    try {
        await apiFetch(`/api/radiology/requests/${id}/complete`, { method: 'PATCH' });
        toast('Radiology completed!', 'success');
        loadRadiologyQueue();
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ===== BILLING =====
async function loadBillingQueue() {
    try {
        const data = await apiFetch('/api/billing/billing/queue');
        const tbody = document.getElementById('billing-table-body');
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(r => `
        <tr>
          <td title="${r._id}">${shortId(r._id)}</td>
          <td title="${r.patientId}">${shortId(r.patientId)}</td>
          <td>${r.type || '—'}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${statusBadge(r.paymentStatus)}</td>
          <td>
            <button class="btn btn-success btn-sm" onclick="billingPay('${r._id}')">💳 Pay</button>
          </td>
        </tr>
      `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No pending payments</p></td></tr>';
        }
    } catch (err) {
        const tbody = document.getElementById('billing-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No pending payments</p></td></tr>';
    }
}

document.getElementById('billing-pay-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bill-pay-id').value;
    if (id) await billingPay(id);
});

async function billingPay(id) {
    try {
        await apiFetch(`/api/billing/requests/${id}/pay`, { method: 'PATCH' });
        toast('Payment marked as paid!', 'success');
        loadBillingQueue();
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ===== REPORTS =====
async function loadReportsQueue() {
    try {
        const data = await apiFetch('/api/report/reports/queue');
        const tbody = document.getElementById('reports-table-body');
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(r => `
        <tr>
          <td title="${r._id}">${shortId(r._id)}</td>
          <td title="${r.patientId}">${shortId(r.patientId)}</td>
          <td>${r.type || '—'}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${statusBadge(r.paymentStatus)}</td>
          <td class="action-group">
            ${r.status === 'COMPLETE/READY_FOR_REPORT' ? `<button class="btn btn-primary btn-sm" onclick="generateReport('${r._id}')">📝 Report</button>` : ''}
            ${r.status === 'REPORT_GENERATED' ? `<button class="btn btn-danger btn-sm" onclick="closeRequest('${r._id}')">🔒 Close</button>` : ''}
          </td>
        </tr>
      `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No items ready for report</p></td></tr>';
        }
    } catch (err) {
        const tbody = document.getElementById('reports-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No items ready for report</p></td></tr>';
    }
}

document.getElementById('report-generate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rep-gen-id').value;
    if (id) await generateReport(id);
});

document.getElementById('report-close-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rep-close-id').value;
    if (id) await closeRequest(id);
});

async function generateReport(id) {
    try {
        const data = await apiFetch(`/api/report/requests/${id}/report`, { method: 'PATCH' });
        if (data && data.data) {
            toast('Report generated! Downloading...', 'success');
            downloadReportImage(data.data);
            loadReportsQueue();
        }
    } catch (err) {
        toast(err.message, 'error');
    }
}

function downloadReportImage(reportData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1050;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 1050);

    // Header gradient bar
    const headerGrad = ctx.createLinearGradient(0, 0, 800, 0);
    headerGrad.addColorStop(0, '#0ea5e9');
    headerGrad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, 800, 100);

    // Hospital title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏥 HOSPITAL WORKFLOW SYSTEM', 400, 45);
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Inter-Department Workflow Automation — Medical Report', 400, 72);

    // Report ID bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 100, 800, 50);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Report ID: ${reportData._id || 'N/A'}`, 30, 130);
    ctx.textAlign = 'right';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 770, 130);

    // Patient Details Section
    ctx.textAlign = 'left';
    let y = 185;

    // Section title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('PATIENT INFORMATION', 30, y);
    y += 8;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, y, 740, 2);
    y += 25;

    const patient = reportData.patient;
    const patientName = patient
        ? `${patient.fullname?.firstname || ''} ${patient.fullname?.middlename || ''} ${patient.fullname?.lastname || ''}`.trim()
        : 'N/A';

    const drawField = (label, value, x, yPos) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText(label, x, yPos);
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 15px Arial, sans-serif';
        ctx.fillText(value || 'N/A', x, yPos + 20);
    };

    drawField('Patient Name', patientName, 30, y);
    drawField('Phone', patient?.phone || 'N/A', 420, y);
    y += 55;
    drawField('Age', patient?.age ? `${patient.age} years` : 'N/A', 30, y);
    drawField('Gender', patient?.gender || 'N/A', 420, y);
    y += 55;
    drawField('Patient ID', patient?._id || 'N/A', 30, y);

    // Test Details Section
    y += 70;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('TEST DETAILS', 30, y);
    y += 8;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, y, 740, 2);
    y += 25;

    drawField('Test Type', reportData.type || 'MRI', 30, y);
    drawField('Payment Status', reportData.paymentStatus || 'N/A', 420, y);
    y += 55;
    drawField('Current Department', reportData.currentDepartment || 'N/A', 30, y);
    drawField('Workflow Status', reportData.status || 'N/A', 420, y);

    // RESULT Section — Big badge
    y += 90;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('TEST RESULT', 30, y);
    y += 8;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, y, 740, 2);
    y += 30;

    const result = reportData.reportResult || 'N/A';
    const isPass = result === 'PASS';

    // Result badge background
    const badgeGrad = ctx.createLinearGradient(250, y, 550, y + 80);
    if (isPass) {
        badgeGrad.addColorStop(0, '#059669');
        badgeGrad.addColorStop(1, '#34d399');
    } else {
        badgeGrad.addColorStop(0, '#dc2626');
        badgeGrad.addColorStop(1, '#f87171');
    }

    // Rounded rect for badge
    const bx = 250, by = y, bw = 300, bh = 80, br = 16;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bw - br, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
    ctx.lineTo(bx + bw, by + bh - br);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
    ctx.lineTo(bx + br, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
    ctx.lineTo(bx, by + br);
    ctx.quadraticCurveTo(bx, by, bx + br, by);
    ctx.closePath();
    ctx.fillStyle = badgeGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isPass ? '✅ PASS' : '❌ FAIL', 400, y + 52);

    // Report text
    ctx.textAlign = 'left';
    y += 110;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Report Details:', 30, y);
    y += 18;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(reportData.reportText || 'N/A', 30, y);

    // Footer
    y = 990;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, y, 800, 60);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('This is a system-generated report from Hospital Workflow System', 400, y + 22);
    ctx.fillText('© 2026 Hospital Workflow System — Inter-Department Automation', 400, y + 40);

    // Watermark
    ctx.save();
    ctx.translate(400, 500);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOSPITAL WF', 0, 0);
    ctx.restore();

    // Download
    const link = document.createElement('a');
    link.download = `MRI_Report_${reportData._id || 'unknown'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function closeRequest(id) {
    try {
        await apiFetch(`/api/report/requests/${id}/close`, { method: 'PATCH' });
        toast('Request closed!', 'success');
        loadReportsQueue();
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ===== HISTORY =====
document.getElementById('history-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('hist-req-id').value;
    const tbody = document.getElementById('history-table-body');
    try {
        const data = await apiFetch(`/api/history/requests/${id}/history`);
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(h => {
                const updater = (h.updatedBy && typeof h.updatedBy === 'object') ? h.updatedBy.name || h.updatedBy.email || '—' : '—';
                return `
        <tr>
          <td>${h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}</td>
          <td>${h.department || '—'}</td>
          <td>${h.action || '—'}</td>
          <td>${statusBadge(h.status)}</td>
          <td>${updater}</td>
        </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>No history found for this request</p></td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = `< tr > <td colspan="5" class="empty-state"><p style="color:var(--danger)">${err.message}</p></td></tr > `;
    }
});

// ===== REGISTER STAFF =====
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const body = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value,
            department: document.getElementById('reg-dept').value,
        };
        const data = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (data) {
            toast('Staff registered successfully!', 'success');
            document.getElementById('register-form').reset();
            loadStaff();
        }
    } catch (err) {
        toast(err.message, 'error');
    }
});

// ===== STAFF MANAGEMENT =====
async function loadStaff() {
    try {
        const data = await apiFetch('/api/auth/staff');
        const tbody = document.getElementById('staff-table-body');
        const currentUser = getUser();
        if (data && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(s => {
                const isSelf = String(s._id) === String(currentUser?.id);
                return `
        <tr>
          <td title="${s._id}">${shortId(s._id)}</td>
          <td>${s.name || '—'}</td>
          <td>${s.email || '—'}</td>
          <td><span class="badge ${s.role === 'ADMIN' ? 'badge-approved' : 'badge-pending'}">${s.role}</span></td>
          <td>${s.department || 'All Departments'}</td>
          <td class="action-group">
            ${!isSelf && s.role !== 'ADMIN' ? `
              <button class="btn btn-primary btn-sm" onclick="openEditModal('${s._id}', '${(s.name || '').replace(/'/g, "\\'")}', '${(s.email || '').replace(/'/g, "\\'")}', '${s.department || ''}')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteStaff('${s._id}')">🗑️</button>
            ` : (isSelf ? '<span style="color:var(--text-secondary);font-size:12px;">You</span>' : '')}
          </td>
        </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No staff found</p></td></tr>';
        }
    } catch (err) {
        const tbody = document.getElementById('staff-table-body');
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Could not load staff</p></td></tr>';
    }
}

function openEditModal(id, name, email, dept) {
    document.getElementById('edit-staff-id').value = id;
    document.getElementById('edit-staff-name').value = name;
    document.getElementById('edit-staff-email').value = email;
    document.getElementById('edit-staff-dept').value = dept;
    document.getElementById('edit-staff-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-staff-modal').style.display = 'none';
}

document.getElementById('edit-staff-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-staff-id').value;
    const body = {
        name: document.getElementById('edit-staff-name').value,
        email: document.getElementById('edit-staff-email').value,
        department: document.getElementById('edit-staff-dept').value,
    };
    try {
        await apiFetch(`/api/auth/staff/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        toast('Staff updated successfully!', 'success');
        closeEditModal();
        loadStaff();
    } catch (err) {
        toast(err.message, 'error');
    }
});

async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
        await apiFetch(`/api/auth/staff/${id}`, { method: 'DELETE' });
        toast('Staff deleted successfully!', 'success');
        loadStaff();
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ===== DELETE PATIENT =====
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
        await apiFetch(`/api/patient/patient/${id}`, { method: 'DELETE' });
        toast('Patient deleted successfully!', 'success');
        loadPatients();
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ===== INIT =====
(function init() {
    if (getToken() && getUser()) {
        showApp();
    } else {
        showLogin();
    }
})();
