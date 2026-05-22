export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'date_range' | 'number_range' | 'select' | 'multi_select' | 'link';
  required: boolean;
  options?: string[];
}

export interface MoreSection {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  additionalFieldDefinitions?: FieldDefinition[];
  items?: MoreSectionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MoreSectionItem {
  id?: number;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  contentType?: 'simple' | 'article';
  articleContent?: string;
  additionalDetails?: { [key: string]: any };
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
