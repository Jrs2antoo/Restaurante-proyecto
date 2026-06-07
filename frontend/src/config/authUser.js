export function getUserDbEmail(user) {
  if (!user) return "";

  const providerEmail = user.providerData?.find((provider) => provider.email)?.email;
  if (user.email || providerEmail) return user.email || providerEmail;

  return user.uid ? `${user.uid}@firebase.local` : "";
}

export function getUserDisplayName(user) {
  if (!user) return "";

  const providerName = user.providerData?.find((provider) => provider.displayName)
      ?.displayName;

  return user.displayName || providerName || "";
}
