export function EnumToString(enumObject: any): string {
  return Object.keys(enumObject)
    .map((key) => enumObject[key])
    .join(', ');
}
