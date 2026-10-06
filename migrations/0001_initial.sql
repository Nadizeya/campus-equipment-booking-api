CREATE TABLE equipment (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) > 0),
  location TEXT NOT NULL CHECK(length(trim(location)) > 0)
);

CREATE TABLE bookings (
  id TEXT NOT NULL PRIMARY KEY,
  equipmentId TEXT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  borrowerName TEXT NOT NULL CHECK(length(trim(borrowerName)) > 0),
  startAt INTEGER NOT NULL CHECK(typeof(startAt) = 'integer'),
  endAt INTEGER NOT NULL CHECK(typeof(endAt) = 'integer' AND endAt > startAt),
  purpose TEXT NOT NULL CHECK(length(trim(purpose)) > 0)
);

CREATE INDEX bookings_equipment_time ON bookings(equipmentId, startAt, endAt);

CREATE TRIGGER bookings_insert_conflict BEFORE INSERT ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings WHERE equipmentId = NEW.equipmentId
    AND startAt < NEW.endAt AND endAt > NEW.startAt
)
BEGIN
  SELECT RAISE(ABORT, 'BOOKING_TIME_CONFLICT');
END;

CREATE TRIGGER bookings_update_conflict BEFORE UPDATE ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings WHERE equipmentId = NEW.equipmentId AND id <> NEW.id
    AND startAt < NEW.endAt AND endAt > NEW.startAt
)
BEGIN
  SELECT RAISE(ABORT, 'BOOKING_TIME_CONFLICT');
END;
