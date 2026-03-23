import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloudinaryOptimize'
})
export class CloudinaryOptimizePipe implements PipeTransform {

  transform(url: string, width?: number, height?: number, quality: number = 80): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    const transformations: string[] = [`q_${quality}`, 'f_auto'];

    if (width) {
      transformations.push(`w_${width}`);
    }
    if (height) {
      transformations.push(`h_${height}`);
    }
    // Use c_fill when both dimensions are set (crop to fit), c_limit when only width (preserve aspect ratio)
    transformations.push(width && height ? 'c_fill' : 'c_limit');

    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }

    return url;
  }
}

@Pipe({
  name: 'cloudinaryThumbnail'
})
export class CloudinaryThumbnailPipe implements PipeTransform {

  transform(url: string, size: number = 150): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    const transformations = `q_70,f_auto,w_${size},h_${size},c_fill`;

    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }

    return url;
  }
}
