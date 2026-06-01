// Keep these in sync with Dunnit.Api/Validators/ValidationLimits.cs.
// The backend is authoritative; these mirror its limits so the UI can stop
// input before a 400 round-trip.
export const LIST_NAME_MAX_LENGTH = 200;
export const ITEM_TITLE_MAX_LENGTH = 200;
export const ITEM_DESCRIPTION_MAX_LENGTH = 2000;
