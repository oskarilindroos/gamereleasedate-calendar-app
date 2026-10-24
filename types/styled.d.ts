import "styled-components/native";

// Extending the DefaultTheme interface
declare module "styled-components/native" {
  export interface DefaultTheme {
    name: string;
    borderRadius: number;

    colors: {
      primary: string;
      secondary: string;
      background: string;
      success: string;
      secondaryBackground: string;
      headerBackground: string;
      divider: string;
      gradients: string[];
      gradients2: string[];
    };

    fontSizes: {
      s: number;
      m: number;
      l: number;
      xl: number;
    };
  }
}
