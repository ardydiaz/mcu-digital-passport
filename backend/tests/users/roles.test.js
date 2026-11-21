import '../helpers/env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { FRONTEND, fakeUsers, request, startTestServer } from '../helpers/testServer.js';

let server;
before(async () => {
  server = await startTestServer();
});
after(() => server.close());

describe('roles are managed in the system (IT Administrator)', () => {
  test('IT Administrator assigns a role, and it applies on the very next request (no re-sign-in)', async () => {
    const it = await server.signUser({ email: 'it1@mcu.edu.ph', roles: ['ITAdmin'] });
    const staff = await server.signUser({ email: 'teacher1@mcu.edu.ph' });

    assert.equal((await request(server.baseUrl, 'POST', '/api/activities', { token: staff.token })).status, 403);

    const res = await request(server.baseUrl, 'PUT', `/api/users/${staff.id}/roles`, {
      token: it.token,
      origin: FRONTEND,
      body: { roles: ['Organizer'], justification: 'Organizes the Leadership Summit' },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.roles, ['Organizer']);

    // Same session token, new permissions
    const after = await request(server.baseUrl, 'POST', '/api/activities', { token: staff.token, origin: FRONTEND });
    assert.notEqual(after.status, 403);
    const me = await request(server.baseUrl, 'GET', '/api/auth/me', { token: staff.token });
    assert.deepEqual(me.body.data.roles, ['Organizer']);

    const entry = fakeUsers.audit.find((a) => a.action === 'user.roles_changed' && a.userId === staff.id);
    assert.equal(entry.actorId, it.id, 'audit records who made the change');
    assert.equal(entry.justification, 'Organizes the Leadership Summit');
  });

  test('removing a role takes effect immediately', async () => {
    const it = await server.signUser({ email: 'it2@mcu.edu.ph', roles: ['ITAdmin'] });
    const admin = await server.signUser({ email: 'sasd2@mcu.edu.ph', roles: ['Admin'] });
    assert.equal((await request(server.baseUrl, 'GET', '/api/reports/participation', { token: admin.token })).status, 501);
    await request(server.baseUrl, 'PUT', `/api/users/${admin.id}/roles`, { token: it.token, body: { roles: [] } });
    assert.equal((await request(server.baseUrl, 'GET', '/api/reports/participation', { token: admin.token })).status, 403);
  });

  test('deactivating a user signs them out immediately (401)', async () => {
    const it = await server.signUser({ email: 'it3@mcu.edu.ph', roles: ['ITAdmin'] });
    const student = await server.signUser({ email: 'leaving@student.mcu.edu.ph' });
    assert.equal((await request(server.baseUrl, 'GET', '/api/auth/me', { token: student.token })).status, 200);

    const res = await request(server.baseUrl, 'PATCH', `/api/users/${student.id}/status`, {
      token: it.token,
      body: { isActive: false, justification: 'Graduated' },
    });
    assert.equal(res.status, 200);
    assert.equal((await request(server.baseUrl, 'GET', '/api/auth/me', { token: student.token })).status, 401);
  });

  test('the last IT Administrator cannot be removed or deactivated (no lock-out)', async () => {
    fakeUsers.reset();
    const it = await server.signUser({ email: 'only.it@mcu.edu.ph', roles: ['ITAdmin'] });

    const remove = await request(server.baseUrl, 'PUT', `/api/users/${it.id}/roles`, { token: it.token, body: { roles: ['Admin'] } });
    assert.equal(remove.status, 409);

    const second = await server.signUser({ email: 'second.it@mcu.edu.ph', roles: ['ITAdmin'] });
    const deactivate = await request(server.baseUrl, 'PATCH', `/api/users/${it.id}/status`, { token: second.token, body: { isActive: false } });
    assert.equal(deactivate.status, 200, 'allowed once another IT Administrator exists');
  });

  test('you cannot deactivate your own account', async () => {
    const it = await server.signUser({ email: 'self@mcu.edu.ph', roles: ['ITAdmin'] });
    await server.signUser({ email: 'backup.it@mcu.edu.ph', roles: ['ITAdmin'] });
    const res = await request(server.baseUrl, 'PATCH', `/api/users/${it.id}/status`, { token: it.token, body: { isActive: false } });
    assert.equal(res.status, 409);
  });

  test('invalid role names are rejected (400)', async () => {
    const it = await server.signUser({ email: 'it4@mcu.edu.ph', roles: ['ITAdmin'] });
    const target = await server.signUser({ email: 'x@mcu.edu.ph' });
    const res = await request(server.baseUrl, 'PUT', `/api/users/${target.id}/roles`, { token: it.token, body: { roles: ['SuperUser'] } });
    assert.equal(res.status, 400);
  });

  test('unknown user -> 404', async () => {
    const it = await server.signUser({ email: 'it5@mcu.edu.ph', roles: ['ITAdmin'] });
    const res = await request(server.baseUrl, 'PUT', '/api/users/99999/roles', { token: it.token, body: { roles: ['Organizer'] } });
    assert.equal(res.status, 404);
  });

  test('SASD Admin can view users but not change roles; filter by "no role"', async () => {
    const admin = await server.signUser({ email: 'sasd6@mcu.edu.ph', roles: ['Admin'] });
    const target = await server.signUser({ email: 'norole6@mcu.edu.ph' });
    const list = await request(server.baseUrl, 'GET', '/api/users?role=none', { token: admin.token });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.items.some((u) => u.id === target.id));
    assert.ok(list.body.data.items.every((u) => u.roles.length === 0));

    const change = await request(server.baseUrl, 'PUT', `/api/users/${target.id}/roles`, { token: admin.token, body: { roles: ['Organizer'] } });
    assert.equal(change.status, 403);
  });
});
