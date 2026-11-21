/** The domain part of an email address, lowercased. "Juan@Student.MCU.edu.ph" -> "student.mcu.edu.ph" */
export function getEmailDomain(email) {
  const at = typeof email === 'string' ? email.lastIndexOf('@') : -1;
  return at > 0 ? email.slice(at + 1).trim().toLowerCase() : null;
}
