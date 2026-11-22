export interface OptionInput {
  name: string;
  price_delta: number;
}

export interface OptionGroupInput {
  name: string;
  is_required: boolean;
  allow_multiple: boolean;
  options: OptionInput[];
}

// API shape (product_option_groups/product_options) -> editable form shape
export const toOptionGroupInputs = (groups: any[] | undefined): OptionGroupInput[] =>
  (groups ?? []).map((group) => ({
    name: group.name,
    is_required: !!group.is_required,
    allow_multiple: !!group.allow_multiple,
    options: (group.product_options ?? []).map((option: any) => ({
      name: option.name,
      price_delta: Number(option.price_delta ?? 0),
    })),
  }));

// Returns an error message, or null when the groups can be saved.
export const validateOptionGroups = (groups: OptionGroupInput[]): string | null => {
  for (const group of groups) {
    if (!group.name.trim()) return 'Nama grup opsi wajib diisi.';
    if (group.options.length === 0) return `Grup "${group.name}" belum punya opsi.`;
    if (group.options.some((option) => !option.name.trim())) {
      return `Nama opsi di grup "${group.name}" wajib diisi.`;
    }
  }
  return null;
};
