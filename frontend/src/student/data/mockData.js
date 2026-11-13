// Sample data used until the backend endpoints exist.
// TODO: replace each export with an API call (see services/apiClient.js).

export const mockStudent = {
  id: 'stu-001',
  studentNumber: '2023-04387',
  fullName: 'Juan Dela Cruz',
  photoUrl: null, // falls back to initials
  status: 'Active Student',
  college: 'College of Computer Studies',
  program: 'BS Information Technology',
  yearLevel: '3rd Year',
  campus: 'Main Campus',
  validUntil: '2027-08-31',
};

export const mockAttendance = [
  { id: 'att-1', activity: 'Leadership Summit 2026', organizer: 'Office of Student Affairs', attendedAt: '2026-11-08T09:00:00', points: 30 },
  { id: 'att-2', activity: 'Cybersecurity Awareness Seminar', organizer: 'College of Computer Studies', attendedAt: '2026-10-24T13:00:00', points: 20 },
  { id: 'att-3', activity: 'Coastal Clean-up Drive', organizer: 'Community Extension Office', attendedAt: '2026-10-12T06:30:00', points: 40 },
  { id: 'att-4', activity: 'University Foundation Day', organizer: 'Office of Student Affairs', attendedAt: '2026-09-20T08:00:00', points: 15 },
  { id: 'att-5', activity: 'Career Readiness Workshop', organizer: 'Career Center', attendedAt: '2026-09-05T14:00:00', points: 25 },
];

export const mockUpcomingActivities = [
  { id: 'act-1', title: 'Research Colloquium', venue: 'Main Auditorium', startsAt: '2026-11-15T14:00:00', description: 'Student research presentations and panel discussion.', points: 25, registered: true },
  { id: 'act-2', title: 'Intercollegiate Debate Finals', venue: 'Student Center Hall', startsAt: '2026-11-18T17:30:00', description: 'Championship round of the university debate league.', points: 20, registered: false },
  { id: 'act-3', title: 'Christmas Outreach Program', venue: 'Partner Community Center', startsAt: '2026-12-06T08:00:00', description: 'Gift giving and feeding program for partner communities.', points: 40, registered: false },
];

export const mockAchievements = [
  { id: 'ach-1', title: 'First Stamp', description: 'Attended your first university activity.', tier: 'gold', earnedAt: '2026-09-05' },
  { id: 'ach-2', title: 'Community Builder', description: 'Joined a community extension activity.', tier: 'royal', earnedAt: '2026-10-12' },
  { id: 'ach-3', title: 'Lifelong Learner', description: 'Attended 3 seminars or workshops.', tier: 'gold', earnedAt: '2026-10-24' },
  { id: 'ach-4', title: 'Rising Leader', description: 'Took part in a leadership program.', tier: 'royal', earnedAt: '2026-11-08' },
  { id: 'ach-5', title: 'Five-Stamp Explorer', description: 'Collected 5 passport stamps.', tier: 'gold', earnedAt: '2026-11-08' },
  { id: 'ach-6', title: 'Point Master', description: 'Reach 500 points in a semester.', tier: 'gold', earnedAt: null },
];

export const mockPoints = {
  total: 130,
  goal: 200,
  periodLabel: '1st Semester, AY 2026–2027',
};

/** Mock rotating pass token. The real token should be signed and issued by the backend. */
export function generateMockPassToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MCU-${Math.floor(1000 + Math.random() * 9000)}-${suffix}`;
}
