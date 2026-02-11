import { ButtonProps } from "./common";

export interface HeroProps {
  title: React.ReactNode;
  description: React.ReactNode;
  buttons: ButtonProps[];
  status: string;
  techStack: string;
}
