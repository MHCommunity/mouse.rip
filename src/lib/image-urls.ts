const IMAGE_ORIGIN = 'https://i.mouse.rip';

function assetSlug(value: string): string {
  return value.replaceAll('_', '-');
}

export function itemImageUrl(typeOrSlug: string, size: 'large' | 'thumbnail' | 'trap' = 'thumbnail'): string {
  return `${IMAGE_ORIGIN}/images/items/${size}/${assetSlug(typeOrSlug)}.png`;
}

export function mouseImageUrl(typeOrSlug: string, size: 'large' | 'square' | 'thumbnail' = 'thumbnail'): string {
  return `${IMAGE_ORIGIN}/images/mice/${size}/${assetSlug(typeOrSlug)}.png`;
}

export function mouseGroupImageUrl(groupId: string): string {
  return `${IMAGE_ORIGIN}/images/mice/groups/${assetSlug(groupId)}.jpg`;
}

export function locationImageUrl(locationId: string): string {
  return `${IMAGE_ORIGIN}/images/locations/${assetSlug(locationId)}.png`;
}

export function locationHeaderImageUrl(locationId: string): string {
  return `${IMAGE_ORIGIN}/images/locations/headers/${assetSlug(locationId)}.jpg`;
}

export function titleImageUrl(titleId: string): string {
  return `${IMAGE_ORIGIN}/images/titles/${assetSlug(titleId)}.png`;
}
