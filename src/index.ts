import { Hono } from 'hono';
import { InputError, validateBooking, type BookingValues } from './validation';

type Booking = BookingValues & { id: string };
const app = new Hono<{ Bindings: { DB: D1Database } }>();
const columns = 'id, equipmentId, borrowerName, startAt, endAt, purpose';
const response = (booking: Booking) => ({
  ...booking, startAt: new Date(booking.startAt).toISOString(), endAt: new Date(booking.endAt).toISOString()
});

function hasConflict(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes('BOOKING_TIME_CONFLICT') || hasConflict(error.cause);
}

app.onError((error, c) => {
  if (error instanceof InputError) return c.json({ error: error.message }, 400);
  if (hasConflict(error)) return c.json({ error: 'Equipment is already booked during this time' }, 409);
  console.error(error);
  return c.json({ error: 'Internal server error' }, 500);
});
app.notFound(c => c.json({ error: 'Resource not found' }, 404));

async function jsonBody(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { throw new InputError('Request body must be valid JSON'); }
}

async function requireEquipment(db: D1Database, id: string) {
  if (!await db.prepare('SELECT id FROM equipment WHERE id = ?').bind(id).first()) {
    throw new InputError('equipmentId must reference existing equipment');
  }
}

app.get('/api/equipment', async c => {
  const result = await c.env.DB.prepare('SELECT id, name, location FROM equipment ORDER BY id').all();
  return c.json(result.results);
});

app.get('/api/bookings', async c => {
  const result = await c.env.DB.prepare(`SELECT ${columns} FROM bookings ORDER BY startAt, id`).all<Booking>();
  return c.json(result.results.map(response));
});

app.get('/api/bookings/:id', async c => {
  const booking = await c.env.DB.prepare(`SELECT ${columns} FROM bookings WHERE id = ?`).bind(c.req.param('id')).first<Booking>();
  return booking ? c.json(response(booking)) : c.json({ error: 'Booking not found' }, 404);
});

app.post('/api/bookings', async c => {
  const values = validateBooking(await jsonBody(c.req.raw));
  await requireEquipment(c.env.DB, values.equipmentId);
  const id = crypto.randomUUID();
  const booking = await c.env.DB.prepare(`INSERT INTO bookings (${columns}) VALUES (?, ?, ?, ?, ?, ?) RETURNING ${columns}`)
    .bind(id, values.equipmentId, values.borrowerName, values.startAt, values.endAt, values.purpose).first<Booking>();
  if (!booking) throw new Error('Insert returned no booking');
  return c.json(response(booking), 201);
});

app.patch('/api/bookings/:id', async c => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare(`SELECT ${columns} FROM bookings WHERE id = ?`).bind(id).first<Booking>();
  if (!existing) return c.json({ error: 'Booking not found' }, 404);
  const values = validateBooking(await jsonBody(c.req.raw), existing);
  await requireEquipment(c.env.DB, values.equipmentId);
  const booking = await c.env.DB.prepare(`UPDATE bookings SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ? WHERE id = ? RETURNING ${columns}`)
    .bind(values.equipmentId, values.borrowerName, values.startAt, values.endAt, values.purpose, id).first<Booking>();
  return booking ? c.json(response(booking)) : c.json({ error: 'Booking not found' }, 404);
});

app.delete('/api/bookings/:id', async c => {
  const result = await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(c.req.param('id')).run();
  return result.meta.changes ? c.body(null, 204) : c.json({ error: 'Booking not found' }, 404);
});

export default app;
