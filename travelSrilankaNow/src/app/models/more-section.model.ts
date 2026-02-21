export interface MoreSection {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  items?: MoreSectionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MoreSectionItem {
  id?: number;
  title: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
