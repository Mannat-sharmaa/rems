// test_e2e.js - Complete End-to-End Verification Test
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  REMS FULL END-TO-END AUTOMATED VERIFICATION TEST  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.database === 'Connected', `1. Server Health Check (Status: ${health.data.status}, DB: ${health.data.database}, MySQL v${health.data.mysqlVersion})`);

    // 2. Fetch properties list in Mohali
    const props = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/properties?city=Mohali',
      method: 'GET'
    });
    assert(props.status === 200 && props.data.properties && props.data.properties.length > 0, `2. Search Properties in Mohali (found ${props.data.properties?.length || 0} matching properties)`);

    // 3. Fetch Property 101 details
    const prop101 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/properties/101',
      method: 'GET'
    });
    const p101 = prop101.data.property;
    assert(prop101.status === 200 && p101 && p101.property_id === 101, `3. Fetch Property #101 Details ("${p101?.title}", City: ${p101?.city}, Price: ₹${p101?.price?.toLocaleString('en-IN')})`);

    // 4. Customer Login: Mannat Sharma
    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'mannat@example.com', password: 'password123' });
    assert(loginRes.status === 200 && loginRes.data.token && loginRes.data.user?.role === 'Customer', `4. Customer Login (${loginRes.data.user?.name} - Role: ${loginRes.data.user?.role})`);
    const customerToken = loginRes.data.token;

    // 5. Schedule a Visit for Property 101
    const visitRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/visits',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, {
      property_id: 101,
      visit_date: '2026-11-20',
      visit_time: '14:30:00',
      remarks: 'Interested in evaluating floor plan and natural sunlight.'
    });
    assert((visitRes.status === 201 && visitRes.data.visitId) || (visitRes.status === 409), `5. Schedule Property Visit (Status: ${visitRes.status}, ${visitRes.data?.message || 'Visit ID: ' + visitRes.data?.visitId})`);

    // 6. Test Transactional Booking on Available Property
    // Find an available property first
    const availRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/properties?status=Available',
      method: 'GET'
    });
    const availProps = availRes.data.properties || [];
    assert(availProps.length > 0, `6a. Found ${availProps.length} Available Properties in MySQL`);

    if (availProps.length > 0) {
      const targetProp = availProps[0];
      const targetId = targetProp.property_id;
      console.log(`    Selected Property #${targetId} ("${targetProp.title}", ₹${targetProp.price}) for atomic booking test`);

      const bookingRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        }
      }, {
        property_id: targetId,
        booking_amount: 50000,
        payment_method: 'UPI'
      });
      assert(bookingRes.status === 201 && bookingRes.data.booking?.bookingId, `6b. ACID Transactional Booking Successful (Booking #${bookingRes.data?.booking?.bookingId}, TXN: ${bookingRes.data?.booking?.transactionId})`);

      // 7. Verify Double-Booking Prevention (Immediate second attempt must fail with 409)
      const doubleBookRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        }
      }, {
        property_id: targetId,
        booking_amount: 50000,
        payment_method: 'Card'
      });
      assert(doubleBookRes.status === 409, `7. Double-Booking Prevented (HTTP ${doubleBookRes.status}: "${doubleBookRes.data?.message}")`);
    }

    // 8. Customer Profile & Bookings List
    const myBookings = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings/my',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(myBookings.status === 200 && Array.isArray(myBookings.data.bookings), `8. Customer My-Bookings Retrieved (${myBookings.data.bookings.length} total bookings listed)`);

    // 9. Agent Login: Rahul Sharma (rahul.agent@rems.com)
    const agentLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'rahul.agent@rems.com', password: 'password123' });
    assert(agentLogin.status === 200 && agentLogin.data.user?.role === 'Agent', `9. Agent Login (${agentLogin.data.user?.name} - Role: ${agentLogin.data.user?.role})`);
    const agentToken = agentLogin.data.token;

    // 10. Agent Dashboard KPIs
    const agentDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/agent/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${agentToken}` }
    });
    assert(agentDash.status === 200 && agentDash.data.stats?.totalProperties !== undefined, `10. Agent Dashboard KPIs (Assigned Properties: ${agentDash.data.stats?.totalProperties}, Completed Sales: ${agentDash.data.stats?.completedSales}, Commission: ₹${Number(agentDash.data.stats?.totalCommission).toLocaleString('en-IN')})`);

    // 11. Admin Login: System Administrator (admin@rems.com)
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@rems.com', password: 'admin123' });
    assert(adminLogin.status === 200 && adminLogin.data.user?.role === 'Admin', `11. Admin Login (${adminLogin.data.user?.name} - Role: ${adminLogin.data.user?.role})`);
    const adminToken = adminLogin.data.token;

    // 12. Admin Dashboard Stats
    const adminDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminDash.status === 200 && adminDash.data.stats?.totalProperties > 0, `12. Admin KPIs: ${adminDash.data.stats?.totalProperties} Properties, ₹${Number(adminDash.data.stats?.totalRevenue).toLocaleString('en-IN')} Total Revenue Collected`);

    // 13. Reports: Properties by City View
    const cityReport = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports/properties-by-city',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(cityReport.status === 200 && cityReport.data.data?.length > 0, `13. Report from MySQL View City_Wise_Property_Stats (${cityReport.data.data?.length} cities)`);

    // 14. Reports: Agent Performance View
    const agentPerf = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports/agent-performance',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(agentPerf.status === 200 && agentPerf.data.data?.length > 0, `14. Report from MySQL View Agent_Performance (${agentPerf.data.data?.length} agents)`);

    // 15. SQL Console: Execute Query #1 (All Available Properties)
    const q1 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute-by-id',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { id: 1 });
    assert(q1.status === 200 && q1.data.rows?.length > 0, `15. SQL Console: Query #1 ("${q1.data.query?.title}") - ${q1.data.rows?.length} rows returned in ${q1.data.durationMs}ms`);

    // 16. SQL Console: Execute Query #10 (Customer Booking History INNER JOIN)
    const q10 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute-by-id',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { id: 10 });
    assert(q10.status === 200 && q10.data.rows?.length > 0, `16. SQL Console: Query #10 ("${q10.data.query?.title}") - ${q10.data.rows?.length} rows returned`);

    // 17. SQL Console: Execute Query #15 (Subquery: Properties priced above average)
    const q15 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute-by-id',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { id: 15 });
    assert(q15.status === 200 && q15.data.rows?.length > 0, `17. SQL Console: Query #15 ("${q15.data.query?.title}") - ${q15.data.rows?.length} rows returned`);

    // 18. SQL Console: Execute Query #31 (5-Table JOIN Transaction Ledger)
    const q31 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute-by-id',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { id: 31 });
    assert(q31.status === 200 && q31.data.rows?.length > 0, `18. SQL Console: Query #31 ("${q31.data.query?.title}") - ${q31.data.rows?.length} rows returned`);

    // 19. SQL Console: Custom Safe Read Query
    const customQ = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute-custom',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { sql: 'SELECT property_status, count(*) AS count, avg(price) AS avg_price FROM properties GROUP BY property_status' });
    assert(customQ.status === 200 && customQ.data.rows?.length > 0, `19. SQL Console: Custom Aggregation Query Executed (${customQ.data.rows?.length} status categories analyzed)`);

    console.log('\n====================================================');
    console.log(`  VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL END-TO-END DBMS SYSTEM TESTS PASSED SUCCESSFULLY! 🎉\n');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
