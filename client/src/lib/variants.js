// Shared helpers for products that have length/colour/density variants (see AdminProducts and ProductDetail).

export function hasVariants(product) {
  return Array.isArray(product?.variants) && product.variants.length > 0;
}

export function variantLabel(v) {
  return [v.length, v.color, v.density].filter(Boolean).join(' / ');
}

export function priceRange(product) {
  if (!hasVariants(product)) return { min: product.price, max: product.price };
  const prices = product.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// Cheapest variant — used as the sensible default selection and for "quick add" from a card.
export function defaultVariant(product) {
  if (!hasVariants(product)) return null;
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

// Builds the cart line for a product + (optional) selected variant.
export function cartLineFor(product, variant, qty = 1) {
  const price = variant ? variant.price : product.price;
  return {
    cartKey: product.id + (variant ? '::' + variant.id : ''),
    productId: product.id,
    variantId: variant ? variant.id : null,
    name: product.name,
    variantLabel: variant ? variantLabel(variant) : '',
    price,
    oldPrice: !variant ? product.oldPrice : null,
    image: (variant && variant.image) || product.image,
    badge: product.badge,
    qty
  };
}

// Every distinct length/colour/density value used across a product's variants, in first-seen order —
// used to build the picker dropdowns on the product page (a dimension with only one value across all
// variants isn't shown, since there's nothing to choose).
export function variantDimensions(product) {
  const lengths = [];
  const colors = [];
  const densities = [];
  (product.variants || []).forEach((v) => {
    if (v.length && !lengths.includes(v.length)) lengths.push(v.length);
    if (v.color && !colors.includes(v.color)) colors.push(v.color);
    if (v.density && !densities.includes(v.density)) densities.push(v.density);
  });
  return {
    lengths: lengths.length > 1 ? lengths : [],
    colors: colors.length > 1 ? colors : [],
    densities: densities.length > 1 ? densities : []
  };
}

export function findVariant(product, { length, color, density } = {}) {
  return (product.variants || []).find(
    (v) => (!length || v.length === length) && (!color || v.color === color) && (!density || v.density === density)
  );
}
