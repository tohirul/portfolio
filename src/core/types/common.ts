import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}
