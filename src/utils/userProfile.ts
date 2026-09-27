// User Profile Local Persistence Helper for Auto-fill Logic
// Reads/stores legitimate user details (Name, Mobile, Email) entered during interactions

export interface UserProfile {
  name: string;
  mobile: string;
  email: string;
}

const STORAGE_KEY = "ky_user_profile";
const BACKUP_STORAGE_KEY = "ky_user_data";

/**
 * Retrieves previously entered user profile from storage or legitimate form interactions.
 * Returns empty fields if no prior legitimate data exists.
 */
export function getSavedUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return { name: "", mobile: "", email: "" };
  }

  let profile: Partial<UserProfile> = {};

  // 1. Try sessionStorage first (current active session)
  try {
    const sessionData = sessionStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(BACKUP_STORAGE_KEY);
    if (sessionData) {
      profile = { ...profile, ...JSON.parse(sessionData) };
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 2. Try localStorage (previous visits)
  if (!profile.name || !profile.mobile || !profile.email) {
    try {
      const localData = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(BACKUP_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (!profile.name && parsed.name) profile.name = parsed.name;
        if (!profile.mobile && (parsed.mobile || parsed.phone)) profile.mobile = parsed.mobile || parsed.phone;
        if (!profile.email && parsed.email) profile.email = parsed.email;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // 3. Fallback: inspect any visible existing enquiry/booking form on the page if user has already typed into it
  if (!profile.name || !profile.mobile || !profile.email) {
    try {
      if (!profile.name) {
        const nameInput = document.querySelector<HTMLInputElement>(
          'input[name="name"], input[id="name"], input[placeholder*="Name" i]'
        );
        if (nameInput && nameInput.value.trim().length > 1) {
          profile.name = nameInput.value.trim();
        }
      }

      if (!profile.mobile) {
        const phoneInput = document.querySelector<HTMLInputElement>(
          'input[name="phone"], input[name="mobile"], input[id="phone"], input[placeholder*="Phone" i], input[placeholder*="Mobile" i]'
        );
        if (phoneInput && phoneInput.value.trim().length >= 10) {
          profile.mobile = phoneInput.value.trim();
        }
      }

      if (!profile.email) {
        const emailInput = document.querySelector<HTMLInputElement>(
          'input[name="email"], input[id="email"], input[type="email"], input[placeholder*="Email" i]'
        );
        if (emailInput && emailInput.value.trim().includes("@")) {
          profile.email = emailInput.value.trim();
        }
      }
    } catch (e) {
      // Ignore DOM querying errors
    }
  }

  return {
    name: profile.name?.trim() || "",
    mobile: profile.mobile?.trim() || "",
    email: profile.email?.trim() || "",
  };
}

/**
 * Saves user profile to both sessionStorage and localStorage when a user legitimately interacts with a form.
 */
export function saveUserProfile(data: { name?: string; mobile?: string; phone?: string; email?: string }): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getSavedUserProfile();
    const updated: UserProfile = {
      name: (data.name && data.name.trim()) || existing.name,
      mobile: (data.mobile && data.mobile.trim()) || (data.phone && data.phone.trim()) || existing.mobile,
      email: (data.email && data.email.trim()) || existing.email,
    };

    // Save only if at least one field has content
    if (updated.name || updated.mobile || updated.email) {
      const serialized = JSON.stringify(updated);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
    }
  } catch (e) {
    // Non-fatal if storage is blocked or quota exceeded
  }
}
