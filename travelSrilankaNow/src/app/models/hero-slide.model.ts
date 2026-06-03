export interface SlideTextStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textShadow?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
}

export interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  titleStyle?: SlideTextStyle;
  subtitleStyle?: SlideTextStyle;
  contentAlign?: 'left' | 'center' | 'right';
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  active: boolean;
  displayDuration: number;
  createdAt?: string;
  updatedAt?: string;
}
