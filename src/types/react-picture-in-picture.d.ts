declare module 'react-picture-in-picture' {
  import { ReactNode } from 'react';

  interface PictureInPictureProps {
    isActive: boolean;
    onClose: () => void;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children: ReactNode;
  }

  export function PictureInPicture(props: PictureInPictureProps): JSX.Element;
}
