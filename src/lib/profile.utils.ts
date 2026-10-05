/**
 * Returns the avatar source URL for a user
 * @param id - The user ID
 * @returns The avatar source URL
 */
export function profileImageUrl(id: string | null): string {
  if (!id) return '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  return `${baseUrl}/avatar/user/${id}`;
}
