import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
  animateChild
} from '@angular/animations';

// Smooth fade transition for page navigation
export const routeAnimations = trigger('routeAnimations', [
  // Default transition between pages
  transition('* <=> *', [
    // Set up initial styles
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 1
      })
    ], { optional: true }),

    // Animate leaving page out and entering page in
    group([
      query(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ], { optional: true }),

      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('400ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ]),

    // Trigger child animations after page transition
    query(':enter', animateChild(), { optional: true })
  ])
]);

// Slide animation for detail pages
export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(30px)'
    }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'translateX(0)'
    }))
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 0,
      transform: 'translateX(-30px)'
    }))
  ])
]);

// Fade up animation for content blocks
export const fadeUpAnimation = trigger('fadeUp', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(30px)'
    }),
    animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ])
]);

// Stagger animation for lists/grids
export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px)'
      }),
      animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);

// Card entrance animation
export const cardAnimation = trigger('cardAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale(0.95) translateY(20px)'
    }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'scale(1) translateY(0)'
    }))
  ])
]);

// Smooth expand/collapse animation
export const expandAnimation = trigger('expand', [
  transition(':enter', [
    style({
      height: 0,
      opacity: 0,
      overflow: 'hidden'
    }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      height: '*',
      opacity: 1
    }))
  ]),
  transition(':leave', [
    style({
      height: '*',
      opacity: 1,
      overflow: 'hidden'
    }),
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      height: 0,
      opacity: 0
    }))
  ])
]);

// Button press animation
export const buttonPressAnimation = trigger('buttonPress', [
  transition('* => pressed', [
    animate('100ms', style({
      transform: 'scale(0.95)'
    })),
    animate('100ms', style({
      transform: 'scale(1)'
    }))
  ])
]);

// Image fade in animation
export const imageFadeAnimation = trigger('imageFade', [
  transition(':enter', [
    style({
      opacity: 0,
      filter: 'blur(10px)'
    }),
    animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      opacity: 1,
      filter: 'blur(0)'
    }))
  ])
]);
