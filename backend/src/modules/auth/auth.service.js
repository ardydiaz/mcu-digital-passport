// TODO: look up / provision the user record in MySQL using the Entra object id (oid)
// and load their application roles and permissions.
export async function getCurrentUser(tokenUser) {
  return {
    oid: tokenUser.oid,
    email: tokenUser.email,
    name: tokenUser.name,
    roles: tokenUser.roles,
  };
}
