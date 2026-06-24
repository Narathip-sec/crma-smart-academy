// LIFF SDK wrapper — stubbed for local dev, real init when NEXT_PUBLIC_LIFF_ID is set.

import liff from "@line/liff";

let initialized = false;

export type LiffProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export async function initLiff(): Promise<void> {
  if (initialized) return;
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) {
    // Dev mode: skip init silently. getProfile() will return a mock.
    initialized = true;
    return;
  }
  await liff.init({ liffId });
  initialized = true;
}

export async function getProfile(): Promise<LiffProfile> {
  await initLiff();
  if (!process.env.NEXT_PUBLIC_LIFF_ID) {
    return {
      userId: "U_dev_mock_0001",
      displayName: "Dev Cadet",
    };
  }
  if (!liff.isLoggedIn()) {
    liff.login();
    throw new Error("LIFF login redirect in progress");
  }
  const p = await liff.getProfile();
  return {
    userId: p.userId,
    displayName: p.displayName,
    pictureUrl: p.pictureUrl,
  };
}
