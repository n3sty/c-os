import "server-only";

export type AuthActor = {
  userId: string;
  orgId: string | null;
  role: "owner";
};

export async function getAuthActor(): Promise<AuthActor | null> {
  return {
    userId: "dev-user",
    orgId: "dev-org",
    role: "owner",
  };
}

export async function requireAuthActor(): Promise<AuthActor> {
  const actor = await getAuthActor();

  if (!actor) {
    throw new Error("Not authenticated.");
  }

  return actor;
}
