/**
 * Full API Test Script - Tests all endpoints used by the ATS Platform
 * Run: node test_all_pages.js
 */

const BASE_URL = 'http://localhost:5000';

let token = null;

async function apiCall(method, path, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth && token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(`${BASE_URL}${path}`, opts);
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = text; }
        return { status: res.status, ok: res.ok, data: json };
    } catch (e) {
        return { status: 0, ok: false, data: null, error: e.message };
    }
}

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`     ${msg}`); }
function header(msg) { console.log(`\n${'='.repeat(60)}\n▶ ${msg}\n${'='.repeat(60)}`); }

async function testAuth() {
    header('1. AUTH - Login');

    let res = await apiCall('POST', '/api/auth/login', { email: 'admin@hireai.com', password: 'admin123' });
    if (res.ok && res.data?.token) {
        token = res.data.token;
        pass(`Login OK → admin@hireai.com`);
        return;
    }

    res = await apiCall('POST', '/api/auth/login', { email: 'test@test.com', password: 'password123' });
    if (res.ok && res.data?.token) {
        token = res.data.token;
        pass(`Login OK → test@test.com`);
        return;
    }

    // Register fresh user
    const email = `testuser_${Date.now()}@test.com`;
    res = await apiCall('POST', '/api/auth/register', {
        firstName: 'Test', lastName: 'Admin',
        email, password: 'TestPass123!'
    });
    if (res.ok && res.data?.token) {
        token = res.data.token;
        pass(`Registered + logged in → ${email}`);
    } else {
        fail(`Auth failed: ${JSON.stringify(res.data)}`);
    }
}

async function testCandidates() {
    header('2. CANDIDATES PAGE — /api/candidates');

    const listRes = await apiCall('GET', '/api/candidates', null, true);
    if (!listRes.ok) { fail(`GET failed: ${listRes.status} ${JSON.stringify(listRes.data)}`); return; }

    const list = listRes.data?.candidates || (Array.isArray(listRes.data) ? listRes.data : []);
    pass(`GET /api/candidates → ${listRes.status} OK, count: ${list.length}`);
    if (list.length > 0) {
        info(`First: ${list[0].firstName} ${list[0].lastName} | ${list[0].email}`);
    }

    // Create a test candidate
    const addRes = await apiCall('POST', '/api/candidates', {
        firstName: 'Rahul', lastName: 'Sharma',
        email: `rahul.sharma.${Date.now()}@test.com`,
        phone: '9876543210',
        headline: 'Full Stack Developer',
        location: 'Bangalore',
        skills: [{ name: 'React' }, { name: 'Node.js' }],
        source: 'LinkedIn',
    }, true);

    if (addRes.ok) {
        const c = addRes.data?.candidate || addRes.data;
        pass(`POST /api/candidates → Created: ${c?.firstName} ${c?.lastName}`);
    } else {
        fail(`POST failed: ${addRes.status} ${JSON.stringify(addRes.data)}`);
    }
}

async function testJobs() {
    header('3. JOBS PAGE — /api/jobs');

    const listRes = await apiCall('GET', '/api/jobs', null, true);
    if (!listRes.ok) { fail(`GET failed: ${listRes.status} ${JSON.stringify(listRes.data)}`); return; }

    const list = listRes.data?.jobs || (Array.isArray(listRes.data) ? listRes.data : []);
    pass(`GET /api/jobs → ${listRes.status} OK, count: ${list.length}`);
    if (list.length > 0) {
        info(`First: ${list[0].title} | ${list[0].department} | ${list[0].status}`);
    }

    // Create a test job
    const addRes = await apiCall('POST', '/api/jobs', {
        title: 'Backend Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'full_time',
        status: 'active',
        description: 'Build fast and scalable Node.js APIs.',
        requirements: ['Node.js', 'MongoDB', '2+ years experience'],
        salary: { min: 600000, max: 1200000, currency: 'INR' },
    }, true);

    if (addRes.ok) {
        const j = addRes.data?.job || addRes.data;
        pass(`POST /api/jobs → Created: ${j?.title}`);
    } else {
        fail(`POST failed: ${addRes.status} ${JSON.stringify(addRes.data)}`);
    }
}

async function testInterviews() {
    header('4. INTERVIEWS PAGE — /api/interviews');

    // Fetch list
    const listRes = await apiCall('GET', '/api/interviews', null, true);
    if (!listRes.ok) { fail(`GET failed: ${listRes.status} ${JSON.stringify(listRes.data)}`); return; }

    const list = listRes.data?.interviews || (Array.isArray(listRes.data) ? listRes.data : []);
    pass(`GET /api/interviews → ${listRes.status} OK, count: ${list.length}`);
    if (list.length > 0) {
        const i = list[0];
        const cname = i.candidate?.firstName ? `${i.candidate.firstName} ${i.candidate.lastName}` : String(i.candidate || 'N/A');
        info(`First: ${cname} | ${i.type} | ${i.status} | ${new Date(i.scheduledAt).toLocaleString()}`);
    }

    // Fetch candidates & jobs to schedule
    const candRes = await apiCall('GET', '/api/candidates', null, true);
    const jobRes = await apiCall('GET', '/api/jobs', null, true);
    const candidates = candRes.data?.candidates || (Array.isArray(candRes.data) ? candRes.data : []);
    const jobs = jobRes.data?.jobs || (Array.isArray(jobRes.data) ? jobRes.data : []);

    if (candidates.length > 0 && jobs.length > 0) {
        const scheduledAt = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
        const addRes = await apiCall('POST', '/api/interviews', {
            candidate: candidates[0]._id,
            job: jobs[0]._id,
            scheduledAt,
            duration: 45,
            type: 'video',
            notes: 'Scheduled by automated test script',
        }, true);

        if (addRes.ok) {
            pass(`POST /api/interviews → Scheduled for ${candidates[0].firstName} ${candidates[0].lastName}`);
        } else {
            fail(`POST failed: ${addRes.status} ${JSON.stringify(addRes.data)}`);
        }
    } else {
        info(`Skipping interview creation (candidates: ${candidates.length}, jobs: ${jobs.length})`);
    }
}

async function testInsights() {
    header('5. AI INSIGHTS PAGE — /api/insights/overview');

    const res = await apiCall('GET', '/api/insights/overview', null, true);
    if (!res.ok) { fail(`GET failed: ${res.status} ${JSON.stringify(res.data)}`); return; }

    pass(`GET /api/insights/overview → ${res.status} OK`);
    const kpis = res.data?.kpis;
    if (kpis) {
        info(`KPIs: totalJobs=${kpis.totalJobs}, activeJobs=${kpis.activeJobs}, totalCandidates=${kpis.totalCandidates}, totalInterviews=${kpis.totalInterviews}`);
    }
    const topCands = res.data?.topCandidates || [];
    info(`Top Candidates: ${topCands.length}`);
    if (topCands.length > 0) info(`First top candidate: ${topCands[0].name || topCands[0].firstName} (score: ${topCands[0].aiScore})`);

    const funnel = res.data?.funnel || [];
    info(`Funnel stages: ${funnel.map(f => `${f.stage}:${f.count}`).join(', ') || 'none'}`);
}

async function testPipelinePage() {
    header('6. PIPELINE PAGE — Built from /api/candidates');

    const res = await apiCall('GET', '/api/candidates', null, true);
    if (!res.ok) { fail(`/api/candidates failed: ${res.status}`); return; }

    const candidates = res.data?.candidates || (Array.isArray(res.data) ? res.data : []);
    pass(`Pipeline source OK → ${candidates.length} candidates available`);

    // Show stage distribution
    const stages = {};
    candidates.forEach(c => {
        const stage = c.appliedJobs?.[0]?.stage || 'sourced';
        stages[stage] = (stages[stage] || 0) + 1;
    });
    info(`Stage distribution: ${JSON.stringify(stages)}`);
}

async function testTalentPool() {
    header('7. TALENT POOL PAGE — Built from /api/candidates');

    const res = await apiCall('GET', '/api/candidates', null, true);
    if (!res.ok) { fail(`/api/candidates failed: ${res.status}`); return; }

    const data = res.data?.candidates || (Array.isArray(res.data) ? res.data : []);
    pass(`Talent Pool source OK → ${data.length} candidates`);
}

async function testDashboard() {
    header('8. DASHBOARD HOME — 3 combined endpoints');

    const [insRes, intvRes, candRes] = await Promise.all([
        apiCall('GET', '/api/insights/overview', null, true),
        apiCall('GET', '/api/interviews', null, true),
        apiCall('GET', '/api/candidates', null, true),
    ]);

    insRes.ok ? pass(`  /api/insights/overview → ${insRes.status}`) : fail(`  insights → ${insRes.status}: ${JSON.stringify(insRes.data)}`);
    intvRes.ok ? pass(`  /api/interviews → ${intvRes.status}`) : fail(`  interviews → ${intvRes.status}: ${JSON.stringify(intvRes.data)}`);
    candRes.ok ? pass(`  /api/candidates → ${candRes.status}`) : fail(`  candidates → ${candRes.status}: ${JSON.stringify(candRes.data)}`);
}

async function testCandidateDetail() {
    header('9. CANDIDATE DETAIL — /api/candidates/:id');

    const listRes = await apiCall('GET', '/api/candidates', null, true);
    const list = listRes.data?.candidates || (Array.isArray(listRes.data) ? listRes.data : []);

    if (list.length === 0) { info('No candidates to detail-test'); return; }

    const id = list[0]._id;
    const detailRes = await apiCall('GET', `/api/candidates/${id}`, null, true);
    if (detailRes.ok) {
        const c = detailRes.data?.candidate || detailRes.data;
        pass(`GET /api/candidates/${id} → ${detailRes.status} OK`);
        info(`Detail: ${c?.firstName} ${c?.lastName} | ${c?.headline || 'No headline'} | Skills: ${(c?.skills || []).map(s => s.name || s).join(', ')}`);
    } else {
        fail(`GET /api/candidates/${id} → ${detailRes.status}: ${JSON.stringify(detailRes.data)}`);
    }
}

async function testJobDetail() {
    header('10. JOB DETAIL — /api/jobs/:id');

    const listRes = await apiCall('GET', '/api/jobs', null, true);
    const list = listRes.data?.jobs || (Array.isArray(listRes.data) ? listRes.data : []);

    if (list.length === 0) { info('No jobs to detail-test'); return; }

    const id = list[0]._id;
    const detailRes = await apiCall('GET', `/api/jobs/${id}`, null, true);
    if (detailRes.ok) {
        const j = detailRes.data?.job || detailRes.data;
        pass(`GET /api/jobs/${id} → ${detailRes.status} OK`);
        info(`Detail: ${j?.title} | ${j?.department} | ${j?.status} | ${j?.location}`);
    } else {
        fail(`GET /api/jobs/${id} → ${detailRes.status}: ${JSON.stringify(detailRes.data)}`);
    }
}

async function main() {
    console.log('\n🚀 ATS Platform — Full Page API Test Suite');
    console.log('━'.repeat(60));

    // Verify server is up
    const health = await apiCall('GET', '/api/health');
    if (!health.ok) {
        console.log(`\n❌ Server not reachable at ${BASE_URL}. Make sure backend is running!\n`);
        process.exit(1);
    }
    console.log(`✅ Backend server is UP at ${BASE_URL} (${health.data?.status})`);

    await testAuth();
    await testCandidates();
    await testJobs();
    await testInterviews();
    await testInsights();
    await testPipelinePage();
    await testTalentPool();
    await testDashboard();
    await testCandidateDetail();
    await testJobDetail();

    console.log('\n' + '━'.repeat(60));
    console.log('🎉 All tests complete!\n');
}

main().catch(e => {
    console.error('Fatal error:', e.message);
    process.exit(1);
});
