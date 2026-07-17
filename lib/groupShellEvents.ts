export const GROUP_CREATE_OPEN_EVENT = "momentra:open-group-create";

export function openGroupCreateOverlay(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GROUP_CREATE_OPEN_EVENT));
  }
}
