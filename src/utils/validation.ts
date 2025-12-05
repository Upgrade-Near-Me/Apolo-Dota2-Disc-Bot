export function isValidSteamId(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();

  // Accept Steam64 IDs (17 digits), shorter numeric IDs, or profile URLs containing an ID
  const numericRegex = /^\d{3,25}$/;
  const urlRegex = /steamcommunity\.com\/(profiles|id)\//i;

  return numericRegex.test(trimmed) || urlRegex.test(trimmed);
}

export function assertSteamId(input: string): void {
  if (!isValidSteamId(input)) {
    throw new Error('Invalid Steam ID');
  }
}
