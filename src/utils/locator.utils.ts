export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Flutter web semantics often expose a label once ("Log In")
 * or duplicated ("Company Users Company Users").
 */
export function flutterLabelPattern(label: string): RegExp {
  const escaped = escapeRegExp(label);
  return new RegExp(`^${escaped}(?:\\s+${escaped})?$`);
}
